import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    study_id = Column(String(36), ForeignKey("studies.id"), nullable=False, unique=True, index=True)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False, index=True)
    
    # Template fields matching reference report
    pid = Column(String(32), default="555")
    apt_id = Column(String(32), default="2025252")
    ref_by = Column(String(128), default="Dr. Hiren Shah")
    exam_title = Column(String(128), default="X-RAY CHEST")
    exam_view = Column(String(128), default="X-Ray Chest - PA View")
    registered_on = Column(String(64), nullable=True)
    reported_on = Column(String(64), nullable=True)
    scan_image_url = Column(String(512), nullable=True)
    bullet_findings_json = Column(JSON, nullable=True) # list of string bullet items
    disease_name = Column(String(256), nullable=True)
    disease_type = Column(String(256), nullable=True)
    disease_stage = Column(String(256), nullable=True)
    
    radiologist_id = Column(String(64), nullable=True)
    radiologist_name = Column(String(128), default="Dr. Payal Shah & Dr. Vimal Shah (MD, Radiologist)")
    status = Column(String(32), default="DRAFT") # DRAFT, APPROVED, SIGNED
    clinical_history = Column(Text, nullable=True)
    technique = Column(Text, nullable=True)
    comparison = Column(Text, nullable=True)
    findings_text = Column(Text, nullable=True)
    impression_text = Column(Text, nullable=True)
    advice_text = Column(Text, default="Clinical correlation.")
    recommendations_text = Column(Text, nullable=True)
    clinical_notes_text = Column(Text, nullable=True)
    bi_rads_rads_score = Column(String(32), nullable=True)
    signed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    study = relationship("Study", back_populates="reports")
    patient = relationship("Patient", back_populates="reports")
    versions = relationship("ReportVersion", back_populates="report", cascade="all, delete-orphan")
    exports = relationship("Export", back_populates="report", cascade="all, delete-orphan")

class ReportVersion(Base):
    __tablename__ = "report_versions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String(36), ForeignKey("reports.id"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    findings_text = Column(Text, nullable=True)
    impression_text = Column(Text, nullable=True)
    recommendations_text = Column(Text, nullable=True)
    edited_by = Column(String(128), nullable=True)
    change_summary = Column(String(256), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    report = relationship("Report", back_populates="versions")
