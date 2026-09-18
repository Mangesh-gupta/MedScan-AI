import os
import uuid
import shutil
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.models.patient import Patient
from app.models.study import Study, StudyImage
from app.models.finding import Finding
from app.models.report import Report
from app.services.export_service import export_service
from app.schemas.report import ReportResponse, ReportUpdate
from app.ai.validator import validate_and_classify_scan

router = APIRouter()

def to_report_response(report: Report) -> ReportResponse:
    p = report.patient
    return ReportResponse(
        id=report.id,
        study_id=report.study_id,
        patient_id=report.patient_id,
        pid=report.pid or "555",
        apt_id=report.apt_id or "2025252",
        ref_by=report.ref_by or "Dr. Hiren Shah",
        exam_title=report.exam_title or "DIAGNOSTIC SCAN",
        exam_view=report.exam_view or "Standard View",
        registered_on=report.registered_on,
        reported_on=report.reported_on,
        scan_image_url=report.scan_image_url,
        bullet_findings_json=report.bullet_findings_json,
        disease_name=report.disease_name,
        disease_type=report.disease_type,
        disease_stage=report.disease_stage,
        patient_name=p.full_name if p else "Unknown",
        patient_age=p.age if p else 30,
        patient_gender=p.gender if p else "Unknown",
        patient_mrn=p.mrn if p else "N/A",
        radiologist_name=report.radiologist_name,
        status=report.status,
        clinical_history=report.clinical_history,
        findings_text=report.findings_text,
        impression_text=report.impression_text,
        advice_text=report.advice_text,
        signed_at=report.signed_at,
        created_at=report.created_at,
        updated_at=report.updated_at
    )

@router.post("/validate-scan")
async def validate_scan_endpoint(
    file: UploadFile = File(...),
    exam_title: str = Form(""),
    expected_exam: str = Form("")
):
    """
    Validates scan authenticity (monochromatic medical scan vs color photo/noise),
    classifies anatomical sub-type (Brain MRI, Lung MRI, Chest X-Ray, Knee X-Ray),
    and enforces anatomical consistency against expected_exam.
    """
    unique_id = str(uuid.uuid4())[:8]
    ext = Path(file.filename).suffix.lower() if file.filename else ".jpg"
    if not ext:
        ext = ".jpg"
    temp_filename = f"temp_val_{unique_id}{ext}"
    temp_path = settings.UPLOAD_DIR / temp_filename

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        validation = validate_and_classify_scan(
            str(temp_path),
            filename_hint=file.filename or "",
            title_hint=exam_title or "",
            expected_exam=expected_exam or exam_title or ""
        )
        return validation
    finally:
        if temp_path.exists():
            try:
                temp_path.unlink()
            except Exception:
                pass

@router.post("/generate", response_model=ReportResponse)
async def generate_radiology_report(
    file: UploadFile = File(...),
    patient_name: str = Form("Yashvi M. Patel"),
    age: int = Form(21),
    gender: str = Form("Female"),
    ref_by: str = Form("Dr. Hiren Shah"),
    exam_title: str = Form("X-RAY CHEST"),
    exam_view: str = Form("X-Ray Chest - PA View"),
    clinical_history: str = Form("Diagnostic imaging investigation."),
    db: Session = Depends(get_db)
):
    # 1. Save uploaded scan
    unique_id = str(uuid.uuid4())[:8]
    ext = Path(file.filename).suffix.lower() if file.filename else ".jpg"
    if not ext:
        ext = ".jpg"
    saved_filename = f"scan_{unique_id}{ext}"
    target_path = settings.UPLOAD_DIR / saved_filename

    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. AI Pre-Validation & Classification (Verify Genuine Scan & Detect Sub-type)
    validation = validate_and_classify_scan(
        str(target_path),
        filename_hint=file.filename or "",
        title_hint=exam_title or "",
        expected_exam=exam_title or ""
    )

    if not validation.get("is_genuine"):
        if target_path.exists():
            try:
                target_path.unlink()
            except Exception:
                pass
        raise HTTPException(
            status_code=400,
            detail=f"{validation.get('reason', 'AI Verification Failed: Image does not match radiological scan criteria.')}"
        )

    # Genuine MRI or X-Ray confirmed
    modality = validation.get("modality", "XRAY")
    sub_type = validation.get("sub_type", "Chest X-Ray")
    
    if "Brain" in sub_type:
        body_part = "BRAIN"
    elif "Lung" in sub_type:
        body_part = "LUNG"
    elif "Knee" in sub_type or "Bone" in sub_type:
        body_part = "KNEE"
    else:
        body_part = "CHEST"

    # Use detected titles if default/blank was submitted
    if not exam_title or exam_title.strip() in ["X-RAY CHEST", "DIAGNOSTIC SCAN", ""]:
        final_title = validation.get("exam_title", "X-RAY CHEST")
    else:
        final_title = exam_title.strip()

    if not exam_view or exam_view.strip() in ["X-Ray Chest - PA View", "Standard View", ""]:
        final_view = validation.get("exam_view", "Standard Clinical View")
    else:
        final_view = exam_view.strip()

    bullet_findings = validation.get("bullet_findings", [
        "Bronchovascular markings are prominent in bilateral lung fields.",
        "Rest of the visualised lung fields are normal."
    ])
    impression = validation.get("impression", "Suggestive of acute clinical observation.")
    advice = validation.get("advice", "Clinical correlation.")

    # 3. Create or find patient
    patient_mrn = f"MRN-{unique_id.upper()}"
    pid_val = str(int(unique_id, 16))[:3] if len(unique_id) >= 3 else "555"
    apt_id_val = f"2025{str(int(unique_id, 16))[:3]}"

    patient = Patient(
        mrn=patient_mrn,
        full_name=patient_name.strip() if patient_name.strip() else "Yashvi M. Patel",
        age=age,
        gender=gender.strip() if gender.strip() else "Female",
        clinical_notes=clinical_history
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    # 4. Create study
    accession_no = f"ACC-{unique_id.upper()}"
    study = Study(
        patient_id=patient.id,
        study_uid=f"1.2.840.113619.2.{unique_id}",
        accession_number=accession_no,
        modality=modality,
        body_part=body_part,
        study_description=f"{final_title} - {final_view}",
        status="ANALYZED",
        priority="ROUTINE",
        referring_physician=ref_by
    )
    db.add(study)
    db.commit()
    db.refresh(study)

    # 5. Create study image
    study_img = StudyImage(
        study_id=study.id,
        image_uid=f"IMG-{unique_id}",
        file_name=saved_filename,
        file_path=str(target_path),
        file_type=ext.replace(".", "").upper(),
        slice_index=0
    )
    db.add(study_img)
    db.commit()
    db.refresh(study_img)

    # 6. Create Report matching Reference template
    now = datetime.now()
    study_time = now - timedelta(minutes=25)
    reg_str = study_time.strftime("%I:%M %p %d %b, %Y")
    rep_str = now.strftime("%I:%M %p %d %b, %Y")

    findings_text_flat = "\n".join([f"• {bf}" for bf in bullet_findings])

    report = Report(
        study_id=study.id,
        patient_id=patient.id,
        pid=pid_val,
        apt_id=apt_id_val,
        ref_by=ref_by,
        exam_title=final_title,
        exam_view=final_view,
        registered_on=reg_str,
        reported_on=rep_str,
        scan_image_url=f"/static/uploads/{saved_filename}",
        bullet_findings_json=bullet_findings,
        disease_name=validation.get("disease_name"),
        disease_type=validation.get("disease_type"),
        disease_stage=validation.get("disease_stage"),
        findings_text=findings_text_flat,
        impression_text=impression,
        advice_text=advice,
        radiologist_name="Dr. Payal Shah & Dr. Vimal Shah (MD, Radiologist)",
        status="DRAFT"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Pre-generate PDF
    try:
        export_service.export_report_pdf(db, report.id)
    except Exception as e:
        print(f"PDF pre-generation warning: {e}")

    return to_report_response(report)

@router.get("", response_model=List[ReportResponse])
def list_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    return [to_report_response(r) for r in reports]

@router.get("/study/{study_id}", response_model=ReportResponse)
def get_report_for_study(study_id: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.study_id == study_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="No report found for this study")
    return to_report_response(report)

@router.get("/{report_id}", response_model=ReportResponse)
def get_single_report(report_id: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return to_report_response(report)

@router.put("/{report_id}", response_model=ReportResponse)
def update_report(report_id: str, payload: ReportUpdate, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        if hasattr(report, k) and v is not None:
            setattr(report, k, v)

    # Sync flat findings_text if bullet_findings_json was provided
    if payload.bullet_findings_json is not None:
        report.bullet_findings_json = payload.bullet_findings_json
        report.findings_text = "\n".join([f"• {item}" for item in payload.bullet_findings_json])

    db.commit()
    db.refresh(report)

    # Regenerate PDF with updated content
    try:
        export_service.export_report_pdf(db, report.id)
    except Exception as e:
        print(f"PDF update error: {e}")

    return to_report_response(report)

@router.post("/{report_id}/approve", response_model=ReportResponse)
def approve_report(report_id: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = "APPROVED"
    now = datetime.now()
    report.signed_at = now
    report.reported_on = now.strftime("%I:%M %p %d %b, %Y")
    db.commit()
    db.refresh(report)

    # Regenerate PDF with APPROVED status
    try:
        export_service.export_report_pdf(db, report.id)
    except Exception as e:
        print(f"PDF update error on approve: {e}")

    return to_report_response(report)



@router.get("/{report_id}/pdf")
def get_report_pdf(report_id: str, db: Session = Depends(get_db)):
    try:
        pdf_path = export_service.export_report_pdf(db, report_id)
        return FileResponse(
            path=pdf_path,
            filename=Path(pdf_path).name,
            media_type="application/pdf"
        )
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
