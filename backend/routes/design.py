# ─── BoxDesign AI — Design Generation Routes ─────────────────────────────────
import os
import uuid
import tempfile
import shutil
import logging
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from sqlalchemy.orm import Session
from utils.db import get_db
from utils.auth_utils import get_current_user, get_optional_user
from models.user import User

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Pydantic models ───────────────────────────────────────────────────────────

class DesignRequest(BaseModel):
    # Step 1 — dimensions
    length_mm: float = Field(..., ge=1.0, le=9999.0)
    width_mm:  float = Field(..., ge=1.0, le=9999.0)
    height_mm: float = Field(..., ge=1.0, le=9999.0)
    box_style: str = "RSC"
    quantity:  Optional[int] = Field(None, ge=1, le=1000000)
    weight_kg: Optional[float] = Field(1.0, ge=0.001, le=10000.0)

    # Step 3 — brand
    brand_name:   str
    product_name: str
    category:     str = "Other"
    tagline:      Optional[str] = ""
    preferred_colours: Optional[str] = ""
    prompt:       Optional[str] = None

    # Step 4 — options
    use_web_research:  bool = True
    barcode_number:    Optional[str] = None


class GenerationJobResponse(BaseModel):
    job_id:            str
    status:            str = "queued"
    estimated_seconds: int = 45


class GenerationStatusResponse(BaseModel):
    job_id:       str
    status:       str      # queued | processing | complete | failed
    progress:     int      # 0–100
    current_step: str
    designs:      Optional[List[dict]] = None


class ResearchRequest(BaseModel):
    product_name: str
    category:     str = "Other"
    brand_name:   str = ""


class OrderAmountRequest(BaseModel):
    tier:       str
    promo_code: Optional[str] = None


# ── Background task ───────────────────────────────────────────────────────────

async def run_generation_pipeline(job_id: str, request: DesignRequest):
    """Runs the full AI generation pipeline in the background."""
    from services.design_generator import generate_all_designs, JOBS
    JOBS[job_id] = {"status": "processing", "progress": 0, "current_step": "Starting...", "designs": []}
    try:
        api_key = os.getenv("OPENAI_API_KEY", "")
        req_dict = request.dict()
        await generate_all_designs(req_dict, api_key, job_id)
    except Exception as e:
        from services.design_generator import JOBS as J
        J[job_id] = {"status": "failed", "progress": 0, "current_step": str(e), "designs": []}
        logger.error(f"Pipeline error for job {job_id}: {e}")


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/generate", response_model=GenerationJobResponse,
             summary="Start design generation job")
async def generate_designs(
    background_tasks: BackgroundTasks,
    request: DesignRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Queue an AI generation job. Returns job_id — poll /status/{job_id} every 2s.
    Runs: web_research → design_generator (10 themes via DALL-E 3 / mock)
    """
    job_id = str(uuid.uuid4())
    # Add user context to job tracking
    from services.design_generator import JOBS
    JOBS[job_id] = {"user_id": current_user.id, "status": "queued"}
    background_tasks.add_task(run_generation_pipeline, job_id, request)
    return GenerationJobResponse(job_id=job_id, status="queued", estimated_seconds=45)


@router.get("/status/{job_id}", response_model=GenerationStatusResponse,
            summary="Poll generation job status")
async def get_generation_status(job_id: str):
    """Poll every 2s. Returns progress 0–100, current_step, and designs when complete."""
    from services.design_generator import get_job_status
    job = get_job_status(job_id)
    return GenerationStatusResponse(
        job_id=job_id,
        status=job.get("status", "not_found"),
        progress=job.get("progress", 0),
        current_step=job.get("current_step", "Unknown"),
        designs=job.get("designs") if job.get("status") == "complete" else None,
    )


@router.get("/result/{job_id}", summary="Get completed designs")
async def get_generation_result(job_id: str):
    """Returns the 10 generated design objects once status=complete."""
    from services.design_generator import get_job_status
    job = get_job_status(job_id)
    if job.get("status") not in ("complete", "processing"):
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    return {"job_id": job_id, "status": job.get("status"), "designs": job.get("designs", [])}


@router.post("/upload-photo", summary="Upload product photo for enhancement")
async def upload_photo(file: UploadFile = File(...)):
    """
    Accept product photo, run quality assessment + background removal + enhancement.
    Returns quality score and enhanced photo path.
    """
    from services.photo_enhance import process_product_photo, assess_quality

    # Save upload to temp file
    suffix = os.path.splitext(file.filename)[1] or ".jpg"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        shutil.copyfileobj(file.file, tmp)
        tmp.close()

        job_id = str(uuid.uuid4())
        result = process_product_photo(tmp.name, job_id)

        return {
            "job_id":        job_id,
            "original_url":  result["original"],
            "enhanced_url":  result["enhanced"],
            "bg_removed_url": result["bg_removed"],
            "quality_score": result["quality"]["score"],
            "quality_issues": result["quality"]["issues"],
            "recommendation": result["quality"]["recommendation"],
            "steps_completed": result["steps_completed"],
        }
    except Exception as e:
        logger.error(f"upload-photo error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            os.unlink(tmp.name)
        except Exception:
            pass


@router.post("/assess-quality", summary="Assess photo quality without full enhancement")
async def assess_photo_quality(file: UploadFile = File(...)):
    """Quick quality check — returns score, issues, recommendation."""
    from services.photo_enhance import assess_quality

    suffix = os.path.splitext(file.filename)[1] or ".jpg"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        shutil.copyfileobj(file.file, tmp)
        tmp.close()
        result = assess_quality(tmp.name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            os.unlink(tmp.name)
        except Exception:
            pass


@router.post("/research", summary="Run web research for product info + competitor images")
async def run_research(req: ResearchRequest):
    """Fetch competitor packaging images (SerpAPI) + product copy (GPT-4o)."""
    from services.web_research import run_full_research
    serpapi_key = os.getenv("SERPAPI_KEY", "")
    openai_key  = os.getenv("OPENAI_API_KEY", "")
    result = await run_full_research(req.product_name, req.category, req.brand_name, serpapi_key, openai_key)
    return result


@router.post("/calculate-price", summary="Calculate order amount with GST")
async def calculate_price(req: OrderAmountRequest):
    """Returns base, discount, GST, total in INR and paise."""
    from services.payment_service import calculate_order_amount
    try:
        return calculate_order_amount(req.tier, req.promo_code)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
