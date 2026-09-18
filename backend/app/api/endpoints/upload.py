import os
import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.session import get_db
from app.models.patient import Patient
from app.models.study import Study, StudyImage
from app.utils.dicom_parser import is_dicom_file, parse_dicom_file

router = APIRouter()

@router.post("")
async def upload_study_files(
    file: UploadFile = File(...),
    patient_name: str = Form(None),
    mrn: str = Form(None),
    modality: str = Form(None),
    body_part: str = Form(None),
    priority: str = Form("ROUTINE"),
    study_description: str = Form(None),
    db: Session = Depends(get_db)
):
    original_filename = file.filename or "upload.jpg"
    ext = Path(original_filename).suffix.lower()
    unique_id = str(uuid.uuid4())[:8]
    saved_filename = f"{unique_id}_{original_filename}"
    target_path = settings.UPLOAD_DIR / saved_filename
    
    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Check if DICOM
    dicom_meta = {}
    is_dcm = is_dicom_file(str(target_path)) or ext in [".dcm", ".dicom"]
    preview_url = None
    
    if is_dcm:
        dicom_meta, preview_path = parse_dicom_file(str(target_path))
        file_type = "DICOM"
        if not modality:
            modality = dicom_meta.get("modality", "CT")
        if not body_part:
            body_part = dicom_meta.get("body_part", "CHEST")
        if not patient_name or patient_name == "ANONYMOUS":
            patient_name = dicom_meta.get("patient_name", f"Patient-{unique_id}")
        if not mrn or mrn == "UNKNOWN":
            mrn = dicom_meta.get("patient_id", f"MRN-{unique_id}")
    else:
        file_type = ext.replace(".", "").upper() or "IMAGE"
        if not modality:
            # infer modality from filename or default to MRI
            fn_lower = original_filename.lower()
            if "brain" in fn_lower or "mri" in fn_lower:
                modality = "MRI"
                body_part = body_part or "BRAIN"
            elif "chest" in fn_lower or "lung" in fn_lower or "xray" in fn_lower:
                modality = "XRAY"
                body_part = body_part or "CHEST"
            elif "ct" in fn_lower or "abdomen" in fn_lower:
                modality = "CT"
                body_part = body_part or "ABDOMEN"
            elif "us" in fn_lower or "thyroid" in fn_lower:
                modality = "ULTRASOUND"
                body_part = body_part or "THYROID"
            else:
                modality = "MRI"
                body_part = body_part or "BRAIN"
                
    patient_name = patient_name or f"Patient {unique_id.upper()}"
    mrn = mrn or f"VG-MRN-{unique_id.upper()}"
    body_part = body_part or "GENERAL"
    study_description = study_description or f"Diagnostic {modality} examination of the {body_part.lower()}"

    # Check or create patient
    patient = db.query(Patient).filter(Patient.mrn == mrn).first()
    if not patient:
        patient = Patient(
            mrn=mrn,
            full_name=patient_name,
            age=45,
            gender="M",
            clinical_notes="Referred for diagnostic clinical investigation."
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)

    # Create study
    accession_no = f"ACC-{unique_id.upper()}"
    study_uid = f"1.2.840.113619.2.{unique_id}"
    study = Study(
        patient_id=patient.id,
        study_uid=study_uid,
        accession_number=accession_no,
        modality=modality.upper(),
        body_part=body_part.upper(),
        study_description=study_description,
        study_date=None,
        status="PENDING",
        priority=priority.upper(),
        referring_physician="Dr. Michael Vance, MD"
    )
    db.add(study)
    db.commit()
    db.refresh(study)

    # Create study image
    study_img = StudyImage(
        study_id=study.id,
        image_uid=f"IMG-{unique_id}",
        file_name=saved_filename,
        file_path=str(target_path),
        file_type=file_type,
        slice_index=0,
        window_center=dicom_meta.get("window_center", 40.0),
        window_width=dicom_meta.get("window_width", 400.0),
        rows=dicom_meta.get("rows", 512),
        columns=dicom_meta.get("columns", 512),
        pixel_spacing=dicom_meta.get("pixel_spacing", "1.0\1.0"),
        metadata_json=dicom_meta
    )
    db.add(study_img)
    db.commit()
    db.refresh(study_img)

    return {
        "success": True,
        "message": "File uploaded and registered successfully",
        "study_id": study.id,
        "accession_number": study.accession_number,
        "patient_name": patient.full_name,
        "modality": study.modality,
        "file_name": saved_filename,
        "file_url": f"/static/uploads/{saved_filename}"
    }
