import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class Annotation(Base):
    __tablename__ = "annotations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    study_id = Column(String(36), ForeignKey("studies.id"), nullable=False, index=True)
    image_id = Column(String(36), ForeignKey("study_images.id"), nullable=True, index=True)
    tool_type = Column(String(32), nullable=False)
    coordinates_json = Column(JSON, nullable=False)
    measurement_value = Column(Float, nullable=True)
    unit = Column(String(16), default="mm")
    label = Column(String(128), nullable=True)
    created_by = Column(String(128), default="Radiologist")
    created_at = Column(DateTime, default=datetime.utcnow)

    study = relationship("Study", back_populates="annotations")
    image = relationship("StudyImage", back_populates="annotations")
