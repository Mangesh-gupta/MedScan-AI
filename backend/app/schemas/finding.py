from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class FindingBase(BaseModel):
    modality: str
    category: str
    finding_text: str
    anatomical_location: str
    severity: str = "MODERATE"
    confidence_score: float
    bounding_box_json: Optional[Dict[str, Any]] = None
    segmentation_mask_url: Optional[str] = None
    heatmap_url: Optional[str] = None
    status: str = "AI_SUGGESTED"
    radiologist_comment: Optional[str] = None

class FindingCreate(FindingBase):
    study_id: str
    image_id: Optional[str] = None

class FindingUpdate(BaseModel):
    status: Optional[str] = None # ACCEPTED, REJECTED, MODIFIED
    radiologist_comment: Optional[str] = None
    severity: Optional[str] = None
    finding_text: Optional[str] = None

class FindingResponse(FindingBase):
    id: str
    study_id: str
    image_id: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
