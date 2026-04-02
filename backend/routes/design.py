# ─── BoxDesign AI — Design Generation Routes ─────────────────────────────────
from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter()


class DesignRequest(BaseModel):
    # Step 1
    length_mm:   float
    width_mm:    float
    height_mm:   float
    box_style:   str = "RSC"
    quantity:    Optional[int] = None
    weight_kg:   Optional[float] = 1.0

    # Step 3
    brand_name:  str
    product_name: str
    category:    str
    prompt:      Optional[str] = None

    # Step 4
    use_web_research: bool = True
    barcode_number:   Optional[str] = None


class GenerationJobResponse(BaseModel):
    job_id:            str
    status:            str = "queued"
    estimated_seconds: int = 45


class GenerationStatusResponse(BaseModel):
    job_id:       str
    status:       str     # queued | processing | complete | failed
    progress:     int     # 0–100
    current_step: str


@router.post("/generate", response_model=GenerationJobResponse,
             summary="Start design generation job")
async def generate_designs(
    background_tasks: BackgroundTasks,
    request: DesignRequest,
):
    """
    Accepts design parameters, queues an AI generation job.
    Returns job_id — client polls /status/{job_id} for progress.

    Internally calls:
    - photo_enhance.py  (RemBG + ESRGAN)
    - design_generator.py (DALL-E / Stable Diffusion × 10 themes)
    - web_research.py   (SerpAPI + GPT for product info)
    - sheet_calculator.py
    """
    job_id = str(uuid.uuid4())
    # TODO: background_tasks.add_task(run_generation_pipeline, job_id, request)
    return GenerationJobResponse(job_id=job_id, status="queued", estimated_seconds=45)


@router.get("/status/{job_id}", response_model=GenerationStatusResponse,
            summary="Poll generation job status")
async def get_generation_status(job_id: str):
    """Poll this endpoint every 2s. Returns progress 0–100 and current step."""
    # TODO: fetch from Redis / DB
    return GenerationStatusResponse(
        job_id=job_id,
        status="processing",
        progress=30,
        current_step="Generating Theme 3/10...",
    )


@router.get("/result/{job_id}", summary="Get completed designs")
async def get_generation_result(job_id: str):
    """Returns the 10 generated design objects once status=complete."""
    # TODO: fetch from DB
    return {"job_id": job_id, "designs": [], "sheet_size": {}}


@router.post("/upload-photo", summary="Upload product photo for enhancement")
async def upload_photo(file: UploadFile = File(...)):
    """
    Accept product photo, run RemBG (background removal) + ESRGAN (upscaling).
    Returns enhanced photo URL.
    """
    # TODO: call services/photo_enhance.py
    return {"original_url": "", "enhanced_url": "", "quality_score": 0.85}
