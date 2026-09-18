from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class BoundingBox(BaseModel):
    x: float # 0 to 100 percentage or pixel
    y: float
    width: float
    height: float
    label: str
    confidence: float
    color: Optional[str] = "#ef4444"

class SegmentationPolygon(BaseModel):
    points: List[List[float]]
    label: str
    color: str

class SaliencyMapPoint(BaseModel):
    x: float
    y: float
    intensity: float

class AIAnalysisRequest(BaseModel):
    study_id: str
    modality: Optional[str] = None
    run_segmentation: bool = True
    generate_report: bool = True

class ModelExecutionLog(BaseModel):
    model_name: str
    stage: str
    execution_time_ms: float
    status: str

class AIAnalysisResult(BaseModel):
    study_id: str
    modality: str
    detected_findings: List[Dict[str, Any]]
    probable_diagnoses: List[Dict[str, Any]]
    confidence_score: float
    bounding_boxes: List[BoundingBox]
    heatmap_url: Optional[str] = None
    segmentation_mask_url: Optional[str] = None
    pipeline_stages: List[ModelExecutionLog]
    clinical_explanation: str
    draft_report: Optional[Dict[str, str]] = None
