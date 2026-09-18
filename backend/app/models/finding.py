import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class Finding(Base):
    __tablename__ = "findings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    study_id = Column(String(36), ForeignKey("studies.id"), nullable=False, index=True)
    image_id = Column(String(36), ForeignKey("study_images.id"), nullable=True, index=True)
    modality = Column(String(16), nullable=False)
    category = Column(String(64), nullable=False) # LESION, TUMOR, FRACTURE, PULMONARY, ORGAN, NODULE
    finding_text = Column(Text, nullable=False)
    anatomical_location = Column(String(128), nullable=False)
    severity = Column(String(32), default="MODERATE") # NORMAL, MILD, MODERATE, SEVERE, CRITICAL
    confidence_score = Column(Float, nullable=False) # 0.00 - 1.00
    bounding_box_json = Column(JSON, nullable=True) # {x, y, width, height}
    segmentation_mask_url = Column(String(512), nullable=True)
    heatmap_url = Column(String(512), nullable=True)
    status = Column(String(32), default="AI_SUGGESTED") # AI_SUGGESTED, ACCEPTED, REJECTED, MODIFIED
    radiologist_comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    study = relationship("Study", back_populates="findings")
    image = relationship("StudyImage", back_populates="findings")
