from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.repositories.study_repository import study_repo
from app.models.study import Study, StudyImage
from app.models.patient import Patient

class StudyService:
    @staticmethod
    def get_studies(db: Session, skip: int = 0, limit: int = 100, modality: Optional[str] = None, status: Optional[str] = None, search: Optional[str] = None):
        return study_repo.get_all(db, skip=skip, limit=limit, modality=modality, status=status, search=search)

    @staticmethod
    def get_study_detail(db: Session, study_id: str):
        return study_repo.get_by_id(db, study_id)

    @staticmethod
    def update_study(db: Session, study_id: str, update_data: Dict[str, Any]):
        study = study_repo.get_by_id(db, study_id)
        if not study:
            return None
        for k, v in update_data.items():
            if v is not None and hasattr(study, k):
                setattr(study, k, v)
        return study_repo.update_study(db, study)

study_service = StudyService()
