from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from app.models.report import Report, ReportVersion
from app.models.export import Export

class ReportRepository:
    def get_by_study(self, db: Session, study_id: str) -> Optional[Report]:
        return db.query(Report).options(joinedload(Report.versions), joinedload(Report.exports)).filter(Report.study_id == study_id).first()

    def get_by_id(self, db: Session, report_id: str) -> Optional[Report]:
        return db.query(Report).options(joinedload(Report.versions), joinedload(Report.exports)).filter(Report.id == report_id).first()

    def create_report(self, db: Session, report: Report) -> Report:
        db.add(report)
        db.commit()
        db.refresh(report)
        return report

    def update_report(self, db: Session, report: Report, edited_by: str = "Radiologist", change_summary: str = "Report edited") -> Report:
        current_version = len(report.versions) + 1 if report.versions else 1
        v = ReportVersion(
            report_id=report.id,
            version_number=current_version,
            findings_text=report.findings_text,
            impression_text=report.impression_text,
            recommendations_text=report.recommendations_text,
            edited_by=edited_by,
            change_summary=change_summary
        )
        db.add(v)
        db.commit()
        db.refresh(report)
        return report

    def record_export(self, db: Session, export_record: Export) -> Export:
        db.add(export_record)
        db.commit()
        db.refresh(export_record)
        return export_record

report_repo = ReportRepository()
