from pydantic import BaseModel
from typing import List, Dict, Any

class ModalityStats(BaseModel):
    mri: int
    ct: int
    xray: int
    ultrasound: int

class CriticalFindingAlert(BaseModel):
    study_id: str
    patient_name: str
    mrn: str
    modality: str
    finding_text: str
    severity: str
    detected_time: str

class ProcessingTrend(BaseModel):
    date: str
    total_studies: int
    ai_analyzed: int
    critical_detected: int

class DashboardMetrics(BaseModel):
    total_studies: int
    pending_review: int
    analyzed_count: int
    signed_off_count: int
    critical_findings_count: int
    average_turnaround_mins: float
    modality_breakdown: ModalityStats
    critical_alerts: List[CriticalFindingAlert]
    processing_trends: List[ProcessingTrend]
    ai_model_health: Dict[str, str]
