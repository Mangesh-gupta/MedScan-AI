from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.core.logging import logger
from app.database.init_db import init_db
from app.api.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads, exports, heatmaps, segmentation masks
app.mount("/static/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")
app.mount("/static/exports", StaticFiles(directory=str(settings.EXPORT_DIR)), name="exports")
app.mount("/static/samples", StaticFiles(directory=str(settings.SAMPLES_DIR)), name="samples")

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Serve Frontend static assets if built
frontend_dist = settings.BASE_DIR.parent / "frontend" / "dist"
if not frontend_dist.exists():
    frontend_dist = settings.BASE_DIR / "frontend" / "dist"

if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="static_assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("static/"):
            return None
        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"app": settings.PROJECT_NAME, "status": "Frontend build not detected"}
else:
    @app.get("/")
    def root():
        return {
            "app": settings.PROJECT_NAME,
            "tagline": "AI-Powered Radiology Copilot for Faster and Smarter Diagnostic Reporting",
            "version": settings.VERSION,
            "docs_url": "/docs",
            "api_prefix": settings.API_V1_STR
        }

@app.on_event("startup")
def startup_event():
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    init_db()
    logger.info("Database schemas initialized.")
