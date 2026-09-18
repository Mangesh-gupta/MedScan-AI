from pathlib import Path
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "MedScan AI"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "AI-Powered Radiology Copilot for Faster and Smarter Diagnostic Reporting"
    API_V1_STR: str = "/api"
    
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    EXPORT_DIR: Path = BASE_DIR / "exports"
    SAMPLES_DIR: Path = BASE_DIR / "samples"
    STATIC_DIR: Path = BASE_DIR / "static"
    
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/visionguard360.db"
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    USE_GPU_IF_AVAILABLE: bool = True
    MONAI_ENABLED: bool = True
    CHEXAGENT_ENABLED: bool = True
    MEDGEMMA_ENABLED: bool = True

    class Config:
        case_sensitive = True

settings = Settings()

settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.EXPORT_DIR.mkdir(parents=True, exist_ok=True)
settings.SAMPLES_DIR.mkdir(parents=True, exist_ok=True)
settings.STATIC_DIR.mkdir(parents=True, exist_ok=True)
