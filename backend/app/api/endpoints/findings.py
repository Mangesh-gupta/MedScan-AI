from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.repositories.finding_repository import finding_repo
from app.schemas.finding import FindingResponse, FindingUpdate, FindingCreate
from app.models.finding import Finding

router = APIRouter()

@router.get("/study/{study_id}", response_model=List[FindingResponse])
def get_findings_for_study(study_id: str, db: Session = Depends(get_db)):
    return finding_repo.get_by_study(db, study_id)

@router.patch("/{finding_id}", response_model=FindingResponse)
def update_finding_status(finding_id: str, payload: FindingUpdate, db: Session = Depends(get_db)):
    updated = finding_repo.update_status(
        db,
        finding_id=finding_id,
        status=payload.status or "ACCEPTED",
        comment=payload.radiologist_comment
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Finding not found")
    return updated

@router.post("", response_model=FindingResponse)
def add_custom_finding(payload: FindingCreate, db: Session = Depends(get_db)):
    f = Finding(
        study_id=payload.study_id,
        image_id=payload.image_id,
        modality=payload.modality,
        category=payload.category,
        finding_text=payload.finding_text,
        anatomical_location=payload.anatomical_location,
        severity=payload.severity,
        confidence_score=payload.confidence_score,
        bounding_box_json=payload.bounding_box_json,
        status="ACCEPTED",
        radiologist_comment=payload.radiologist_comment
    )
    return finding_repo.create(db, f)

@router.delete("/{finding_id}")
def delete_finding(finding_id: str, db: Session = Depends(get_db)):
    success = finding_repo.delete(db, finding_id)
    if not success:
        raise HTTPException(status_code=404, detail="Finding not found")
    return {"success": True, "message": "Finding removed"}
