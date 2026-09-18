from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.repositories.report_repository import report_repo
from app.repositories.study_repository import study_repo
from app.models.report import Report

class ReportService:
    @staticmethod
    def get_report_by_study(db: Session, study_id: str):
        return report_repo.get_by_study(db, study_id)

    @staticmethod
    def update_report(db: Session, report_id: str, update_data: Dict[str, Any], edited_by: str = "Radiologist"):
        report = report_repo.get_by_id(db, report_id)
        if not report:
            return None
        for k, v in update_data.items():
            if v is not None and hasattr(report, k):
                setattr(report, k, v)
        return report_repo.update_report(db, report, edited_by=edited_by, change_summary="Radiologist edited report")

    @staticmethod
    def sign_off_report(db: Session, report_id: str, radiologist_name: str, signature_pin: Optional[str] = None):
        report = report_repo.get_by_id(db, report_id)
        if not report:
            return None
        report.radiologist_name = radiologist_name
        report.status = "SIGNED"
        report.signed_at = datetime.utcnow()
        
        # update study status
        study = study_repo.get_by_id(db, report.study_id)
        if study:
            study.status = "SIGNED_OFF"
            
        return report_repo.update_report(db, report, edited_by=radiologist_name, change_summary="Electronically signed off")

report_service = ReportService()
