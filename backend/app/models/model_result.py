import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class ModelResult(Base):
    __tablename__ = "model_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    study_id = Column(String(36), ForeignKey("studies.id"), nullable=False, index=True)
    model_name = Column(String(64), nullable=False)
    execution_time_ms = Column(Float, nullable=False)
    findings_detected = Column(String(256), nullable=True)
    confidence_avg = Column(Float, nullable=True)
    raw_output_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    study = relationship("Study", back_populates="model_results")
