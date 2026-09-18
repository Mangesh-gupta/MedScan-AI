import os
from pathlib import Path
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.config import settings
from app.repositories.report_repository import report_repo
from app.models.export import Export
from app.utils.pdf_generator import generate_reference_radiology_pdf
from app.utils.docx_generator import generate_radiology_docx

class ExportService:
    @staticmethod
    def export_report_pdf(db: Session, report_id: str) -> str:
        report = report_repo.get_by_id(db, report_id)
        if not report:
            raise ValueError("Report not found")
        
        study = report.study
        patient = report.patient

        # Get scan image path
        scan_image_path = None
        if study.images and len(study.images) > 0:
            scan_image_path = study.images[0].file_path

        file_name = f"MedScan_AI_Report_{report.pid}_{study.accession_number}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
        output_path = str(settings.EXPORT_DIR / file_name)

        generate_reference_radiology_pdf(
            report_dict={
                "pid": getattr(report, "pid", "555") or "555",
                "apt_id": getattr(report, "apt_id", "2025252") or "2025252",
                "ref_by": getattr(report, "ref_by", "Dr. Hiren Shah") or "Dr. Hiren Shah",
                "exam_title": getattr(report, "exam_title", "X-RAY CHEST") or f"{study.modality} {study.body_part}",
                "exam_view": getattr(report, "exam_view", "X-Ray Chest - PA View") or f"{study.modality} - Standard View",
                "registered_on": getattr(report, "registered_on", None),
                "reported_on": getattr(report, "reported_on", None),
                "bullet_findings_json": getattr(report, "bullet_findings_json", None),
                "disease_name": getattr(report, "disease_name", None),
                "disease_type": getattr(report, "disease_type", None),
                "disease_stage": getattr(report, "disease_stage", None),
                "status": getattr(report, "status", "DRAFT"),
                "findings_text": report.findings_text,
                "impression_text": report.impression_text,
                "advice_text": getattr(report, "advice_text", "Clinical correlation.") or "Clinical correlation.",
                "radiologist_name": report.radiologist_name,
                "scan_image_url": scan_image_path
            },
            patient_dict={
                "full_name": patient.full_name,
                "mrn": patient.mrn,
                "age": patient.age,
                "gender": patient.gender,
                "clinical_notes": patient.clinical_notes
            },
            output_path=output_path,
            scan_image_path=scan_image_path
        )

        size = os.path.getsize(output_path) if os.path.exists(output_path) else 0
        export_rec = Export(
            report_id=report.id,
            export_type="PDF",
            file_name=file_name,
            file_path=output_path,
            file_size_bytes=size,
            download_count=1
        )
        report_repo.record_export(db, export_rec)
        return output_path

    @staticmethod
    def export_report_docx(db: Session, report_id: str) -> str:
        report = report_repo.get_by_id(db, report_id)
        if not report:
            raise ValueError("Report not found")
        
        study = report.study
        patient = report.patient
        findings = [
            {
                "category": f.category,
                "anatomical_location": f.anatomical_location,
                "finding_text": f.finding_text,
                "severity": f.severity,
                "confidence_score": f.confidence_score
            }
            for f in study.findings
        ]

        file_name = f"MedScan_AI_Report_{study.accession_number}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.docx"
        output_path = str(settings.EXPORT_DIR / file_name)

        generate_radiology_docx(
            report_data={
                "status": report.status,
                "radiologist_name": report.radiologist_name,
                "clinical_history": report.clinical_history,
                "technique": report.technique,
                "findings_text": report.findings_text,
                "impression_text": report.impression_text,
                "recommendations_text": report.recommendations_text,
                "clinical_notes_text": report.clinical_notes_text
            },
            patient_data={
                "full_name": patient.full_name,
                "mrn": patient.mrn,
                "age": patient.age,
                "gender": patient.gender,
                "clinical_notes": patient.clinical_notes
            },
            study_data={
                "accession_number": study.accession_number,
                "modality": study.modality,
                "body_part": study.body_part,
                "study_date": study.study_date,
                "referring_physician": getattr(report, "ref_by", study.referring_physician)
            },
            findings_list=findings,
            output_path=output_path
        )

        size = os.path.getsize(output_path) if os.path.exists(output_path) else 0
        export_rec = Export(
            report_id=report.id,
            export_type="DOCX",
            file_name=file_name,
            file_path=output_path,
            file_size_bytes=size,
            download_count=1
        )
        report_repo.record_export(db, export_rec)
        return output_path

export_service = ExportService()
