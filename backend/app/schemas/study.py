from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime
from app.schemas.patient import PatientResponse

class StudyImageBase(BaseModel):
    image_uid: str
    file_name: str
    file_path: str
    file_type: str
    slice_index: int = 0
    window_center: Optional[float] = None
    window_width: Optional[float] = None
    rows: Optional[int] = None
    columns: Optional[int] = None
    pixel_spacing: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None

class StudyImageResponse(StudyImageBase):
    id: str
    study_id: str
    created_at: datetime
    image_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class StudyBase(BaseModel):
    study_uid: str
    accession_number: str
    modality: str
    body_part: str
    study_description: Optional[str] = None
    study_date: Optional[str] = None
    status: str = "PENDING"
    priority: str = "ROUTINE"
    referring_physician: Optional[str] = None

class StudyCreate(StudyBase):
    patient_id: str

class StudyUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    study_description: Optional[str] = None
    referring_physician: Optional[str] = None

class FindingSummary(BaseModel):
    id: str
    category: str
    finding_text: str
    anatomical_location: str
    severity: str
    confidence_score: float
    status: str
    model_config = ConfigDict(from_attributes=True)

class StudyResponse(StudyBase):
    id: str
    patient_id: str
    patient: Optional[PatientResponse] = None
    images_count: int = 0
    findings_count: int = 0
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class StudyDetailResponse(StudyBase):
    id: str
    patient_id: str
    patient: Optional[PatientResponse] = None
    images: List[StudyImageResponse] = []
    findings: List[FindingSummary] = []
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
