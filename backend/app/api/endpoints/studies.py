from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.study_service import study_service
from app.schemas.study import StudyResponse, StudyDetailResponse, StudyUpdate, StudyCreate
from app.models.study import Study

router = APIRouter()

@router.get("", response_model=List[StudyResponse])
def list_studies(
    skip: int = 0,
    limit: int = 100,
    modality: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    studies = study_service.get_studies(db, skip=skip, limit=limit, modality=modality, status=status, search=search)
    results = []
    for s in studies:
        res = StudyResponse(
            id=s.id,
            patient_id=s.patient_id,
            patient=s.patient,
            study_uid=s.study_uid,
            accession_number=s.accession_number,
            modality=s.modality,
            body_part=s.body_part,
            study_description=s.study_description,
            study_date=s.study_date,
            status=s.status,
            priority=s.priority,
            referring_physician=s.referring_physician,
            images_count=len(s.images),
            findings_count=len(s.findings),
            created_at=s.created_at,
            updated_at=s.updated_at
        )
        results.append(res)
    return results

@router.get("/{study_id}", response_model=StudyDetailResponse)
def get_study(study_id: str, db: Session = Depends(get_db)):
    study = study_service.get_study_detail(db, study_id)
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    
    # Format images with static URLs
    images_formatted = []
    for img in study.images:
        url = f"/static/uploads/{img.file_name}"
        images_formatted.append({
            "id": img.id,
            "study_id": img.study_id,
            "image_uid": img.image_uid,
            "file_name": img.file_name,
            "file_path": img.file_path,
            "file_type": img.file_type,
            "slice_index": img.slice_index,
            "window_center": img.window_center,
            "window_width": img.window_width,
            "rows": img.rows,
            "columns": img.columns,
            "pixel_spacing": img.pixel_spacing,
            "metadata_json": img.metadata_json,
            "image_url": url,
            "created_at": img.created_at
        })
    
    return StudyDetailResponse(
        id=study.id,
        patient_id=study.patient_id,
        patient=study.patient,
        study_uid=study.study_uid,
        accession_number=study.accession_number,
        modality=study.modality,
        body_part=study.body_part,
        study_description=study.study_description,
        study_date=study.study_date,
        status=study.status,
        priority=study.priority,
        referring_physician=study.referring_physician,
        images=images_formatted,
        findings=study.findings,
        created_at=study.created_at,
        updated_at=study.updated_at
    )

@router.patch("/{study_id}", response_model=StudyResponse)
def update_study(study_id: str, payload: StudyUpdate, db: Session = Depends(get_db)):
    updated = study_service.update_study(db, study_id, payload.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Study not found")
    return updated
