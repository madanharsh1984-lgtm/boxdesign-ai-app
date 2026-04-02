# ─── BoxDesign AI — FastAPI Backend Entry Point ───────────────────────────────
"""
Run locally:
    cd backend
    venv\\Scripts\\activate
    uvicorn main:app --reload --port 8000

Docs: http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import route modules
from routes.auth    import router as auth_router
from routes.design  import router as design_router
from routes.orders  import router as orders_router
from routes.files   import router as files_router

app = FastAPI(
    title="BoxDesign AI API",
    description="Backend API for BoxDesign AI — AI-powered corrugated packaging design platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Startup: create DB tables ─────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    try:
        from utils.db import create_tables
        create_tables()
        logger.info("Database tables created/verified OK")
    except Exception as e:
        logger.warning(f"DB init warning (non-fatal): {e}")

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(auth_router,    prefix="/v1/auth",    tags=["Authentication"])
app.include_router(design_router,  prefix="/v1/design",  tags=["Design Generation"])
app.include_router(orders_router,  prefix="/v1/orders",  tags=["Orders"])
app.include_router(files_router,   prefix="/v1/files",   tags=["File Delivery"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "app": "BoxDesign AI API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/v1/health", tags=["Health"])
async def health():
    return {"status": "ok"}
