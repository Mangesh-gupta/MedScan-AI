import time
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.repositories.study_repository import study_repo
from app.repositories.finding_repository import finding_repo
from app.repositories.report_repository import report_repo
from app.models.finding import Finding
from app.models.report import Report
from app.models.model_result import ModelResult
from app.ai.router import ai_router

class AnalysisService:
    @staticmethod
    def run_study_analysis(db: Session, study_id: str) -> Dict[str, Any]:
        study = study_repo.get_by_id(db, study_id)
        if not study:
            raise ValueError(f"Study {study_id} not found")

        study.status = "PROCESSING"
        db.commit()

        # Find first image or sample image
        image_path = ""
        first_image = study.images[0] if study.images else None
        if first_image and first_image.file_path:
            image_path = first_image.file_path
            
        patient_info = {
            "full_name": study.patient.full_name if study.patient else "ANONYMOUS",
            "age": study.patient.age if study.patient else 50,
            "gender": study.patient.gender if study.patient else "M",
            "clinical_notes": study.patient.clinical_notes if study.patient else ""
        }

        # Run AI Pipeline
        ai_res = ai_router.process_study(
            modality=study.modality,
            body_part=study.body_part,
            image_path=image_path,
            study_id=study.id,
            patient_info=patient_info,
            clinical_history=study.study_description
        )

        # Clear existing AI findings to avoid duplicates
        existing_findings = finding_repo.get_by_study(db, study.id)
        for ef in existing_findings:
            db.delete(ef)
        db.commit()

        # Save AI Findings to DB
        created_findings = []
        for f in ai_res["detected_findings"]:
            finding_obj = Finding(
                study_id=study.id,
                image_id=first_image.id if first_image else None,
                modality=study.modality,
                category=f.get("category", "LESION"),
                finding_text=f.get("finding_text", ""),
                anatomical_location=f.get("anatomical_location", "General"),
                severity=f.get("severity", "MODERATE"),
                confidence_score=f.get("confidence_score", 0.90),
                bounding_box_json=f.get("bounding_box"),
                segmentation_mask_url=ai_res.get("segmentation_mask_path"),
                heatmap_url=ai_res.get("heatmap_path"),
                status="AI_SUGGESTED"
            )
            created_finding = finding_repo.create(db, finding_obj)
            created_findings.append(created_finding)

        # Record Model Execution
        model_result = ModelResult(
            study_id=study.id,
            model_name=ai_res["pipeline_stages"][1]["model_name"],
            execution_time_ms=ai_res["pipeline_stages"][1]["execution_time_ms"],
            findings_detected=f"{len(created_findings)} abnormalities detected",
            confidence_avg=ai_res["confidence_score"],
            raw_output_json=ai_res
        )
        db.add(model_result)

        # Create or Update Draft Report from MedGemma
        draft_dict = ai_res.get("draft_report", {})
        existing_report = report_repo.get_by_study(db, study.id)
        if not existing_report:
            new_report = Report(
                study_id=study.id,
                patient_id=study.patient_id,
                radiologist_name="Dr. Sarah Al-Mansoor, MD, DABR",
                status="DRAFT",
                clinical_history=draft_dict.get("clinical_history", study.study_description),
                technique=draft_dict.get("technique"),
                findings_text=draft_dict.get("findings_text"),
                impression_text=draft_dict.get("impression_text"),
                recommendations_text=draft_dict.get("recommendations_text"),
                clinical_notes_text=draft_dict.get("clinical_notes_text"),
                bi_rads_rads_score=draft_dict.get("bi_rads_rads_score")
            )
            report_repo.create_report(db, new_report)
        else:
            existing_report.findings_text = draft_dict.get("findings_text")
            existing_report.impression_text = draft_dict.get("impression_text")
            existing_report.recommendations_text = draft_dict.get("recommendations_text")
            existing_report.clinical_notes_text = draft_dict.get("clinical_notes_text")
            existing_report.bi_rads_rads_score = draft_dict.get("bi_rads_rads_score")
            existing_report.status = "DRAFT"
            report_repo.update_report(db, existing_report, edited_by="MedGemma AI Copilot", change_summary="Auto-generated draft")

        study.status = "ANALYZED"
        db.commit()

        return ai_res

analysis_service = AnalysisService()
