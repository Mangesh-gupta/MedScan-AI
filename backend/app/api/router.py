from fastapi import APIRouter
from app.api.endpoints import dashboard, studies, upload, analyze, findings, reports, export, statistics

api_router = APIRouter()

api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(studies.router, prefix="/studies", tags=["Studies"])
api_router.include_router(upload.router, prefix="/upload", tags=["Upload"])
api_router.include_router(analyze.router, prefix="/analyze", tags=["AI Analysis"])
api_router.include_router(findings.router, prefix="/findings", tags=["Findings"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(export.router, prefix="/export", tags=["Exports"])
api_router.include_router(statistics.router, prefix="/statistics", tags=["Statistics"])
