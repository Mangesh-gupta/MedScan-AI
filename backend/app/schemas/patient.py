from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class PatientBase(BaseModel):
    mrn: str
    full_name: str
    age: int
    gender: str
    dob: Optional[str] = None
    contact: Optional[str] = None
    clinical_notes: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
