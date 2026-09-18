from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class AnnotationBase(BaseModel):
    tool_type: str # RULER, RECTANGLE, ELLIPSE, ARROW, ANGLE, FREEHAND
    coordinates_json: Dict[str, Any]
    measurement_value: Optional[float] = None
    unit: str = "mm"
    label: Optional[str] = None
    created_by: str = "Radiologist"

class AnnotationCreate(AnnotationBase):
    study_id: str
    image_id: Optional[str] = None

class AnnotationResponse(AnnotationBase):
    id: str
    study_id: str
    image_id: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
