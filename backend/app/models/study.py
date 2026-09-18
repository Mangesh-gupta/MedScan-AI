import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from app.database.session import Base

class Study(Base):
    __tablename__ = "studies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False, index=True)
    study_uid = Column(String(128), unique=True, index=True, nullable=False)
    accession_number = Column(String(64), unique=True, index=True, nullable=False)
    modality = Column(String(16), nullable=False, index=True) # MRI, CT, XRAY, ULTRASOUND
    body_part = Column(String(64), nullable=False) # BRAIN, CHEST, ABDOMEN, PELVIS, THYROID, etc.
    study_description = Column(String(256), nullable=True)
    study_date = Column(String(32), nullable=True)
    status = Column(String(32), default="PENDING", index=True) # PENDING, PROCESSING, ANALYZED, REVIEWED, SIGNED_OFF
    priority = Column(String(16), default="ROUTINE", index=True) # STAT, URGENT, ROUTINE
    referring_physician = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", back_populates="studies")
    images = relationship("StudyImage", back_populates="study", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="study", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="study", cascade="all, delete-orphan")
    model_results = relationship("ModelResult", back_populates="study", cascade="all, delete-orphan")
    annotations = relationship("Annotation", back_populates="study", cascade="all, delete-orphan")

class StudyImage(Base):
    __tablename__ = "study_images"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    study_id = Column(String(36), ForeignKey("studies.id"), nullable=False, index=True)
    image_uid = Column(String(128), unique=True, index=True, nullable=False)
    file_name = Column(String(256), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_type = Column(String(32), nullable=False) # DICOM, JPG, PNG
    slice_index = Column(Integer, default=0)
    window_center = Column(Float, nullable=True)
    window_width = Column(Float, nullable=True)
    rows = Column(Integer, nullable=True)
    columns = Column(Integer, nullable=True)
    pixel_spacing = Column(String(64), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    study = relationship("Study", back_populates="images")
    findings = relationship("Finding", back_populates="image")
    annotations = relationship("Annotation", back_populates="image")
