from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from datetime import datetime

class ReportVersionResponse(BaseModel):
    id: str
    version_number: int
    findings_text: Optional[str] = None
    impression_text: Optional[str] = None
    recommendations_text: Optional[str] = None
    edited_by: Optional[str] = None
    change_summary: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ReportBase(BaseModel):
    pid: Optional[str] = "555"
    apt_id: Optional[str] = "2025252"
    ref_by: Optional[str] = "Dr. Hiren Shah"
    exam_title: Optional[str] = "X-RAY CHEST"
    exam_view: Optional[str] = "X-Ray Chest - PA View"
    registered_on: Optional[str] = None
    reported_on: Optional[str] = None
    scan_image_url: Optional[str] = None
    bullet_findings_json: Optional[List[str]] = None
    disease_name: Optional[str] = None
    disease_type: Optional[str] = None
    disease_stage: Optional[str] = None
    
    radiologist_id: Optional[str] = None
    radiologist_name: Optional[str] = "Dr. Payal Shah & Dr. Vimal Shah (MD, Radiologist)"
    status: str = "DRAFT"
    clinical_history: Optional[str] = None
    technique: Optional[str] = None
    comparison: Optional[str] = None
    findings_text: Optional[str] = None
    impression_text: Optional[str] = None
    advice_text: Optional[str] = "Clinical correlation."
    recommendations_text: Optional[str] = None
    clinical_notes_text: Optional[str] = None
    bi_rads_rads_score: Optional[str] = None

class ReportCreate(ReportBase):
    study_id: str
    patient_id: str

class ReportUpdate(BaseModel):
    findings_text: Optional[str] = None
    bullet_findings_json: Optional[List[str]] = None
    disease_name: Optional[str] = None
    disease_type: Optional[str] = None
    disease_stage: Optional[str] = None
    impression_text: Optional[str] = None
    advice_text: Optional[str] = None
    recommendations_text: Optional[str] = None
    clinical_notes_text: Optional[str] = None
    radiologist_name: Optional[str] = None
    status: Optional[str] = None
    bi_rads_rads_score: Optional[str] = None

class ReportSignRequest(BaseModel):
    radiologist_name: str
    signature_pin: Optional[str] = None
    notes: Optional[str] = None

class ReportResponse(ReportBase):
    id: str
    study_id: str
    patient_id: str
    patient_name: Optional[str] = None
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    patient_mrn: Optional[str] = None
    signed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    versions: List[ReportVersionResponse] = []
    model_config = ConfigDict(from_attributes=True)
