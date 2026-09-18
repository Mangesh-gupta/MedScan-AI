from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.patient import Patient
from app.models.study import Study, StudyImage
from app.models.annotation import Annotation
from app.models.model_result import ModelResult

class StudyRepository:
    def get_all(self, db: Session, skip: int = 0, limit: int = 100, modality: Optional[str] = None, status: Optional[str] = None, search: Optional[str] = None) -> List[Study]:
        query = db.query(Study).options(joinedload(Study.patient), joinedload(Study.images), joinedload(Study.findings))
        if modality:
            query = query.filter(Study.modality == modality.upper())
        if status:
            query = query.filter(Study.status == status.upper())
        if search:
            search_fmt = f"%{search}%"
            query = query.join(Patient).filter(
                (Patient.full_name.ilike(search_fmt)) |
                (Patient.mrn.ilike(search_fmt)) |
                (Study.accession_number.ilike(search_fmt)) |
                (Study.study_description.ilike(search_fmt))
            )
        return query.order_by(Study.created_at.desc()).offset(skip).limit(limit).all()

    def get_by_id(self, db: Session, study_id: str) -> Optional[Study]:
        return db.query(Study).options(
            joinedload(Study.patient),
            joinedload(Study.images),
            joinedload(Study.findings),
            joinedload(Study.reports),
            joinedload(Study.model_results),
            joinedload(Study.annotations)
        ).filter(Study.id == study_id).first()

    def create_study(self, db: Session, study: Study) -> Study:
        db.add(study)
        db.commit()
        db.refresh(study)
        return study

    def update_study(self, db: Session, study: Study) -> Study:
        db.commit()
        db.refresh(study)
        return study

    def add_image(self, db: Session, image: StudyImage) -> StudyImage:
        db.add(image)
        db.commit()
        db.refresh(image)
        return image

    def get_patient(self, db: Session, patient_id: str) -> Optional[Patient]:
        return db.query(Patient).filter(Patient.id == patient_id).first()

    def create_patient(self, db: Session, patient: Patient) -> Patient:
        db.add(patient)
        db.commit()
        db.refresh(patient)
        return patient

study_repo = StudyRepository()
