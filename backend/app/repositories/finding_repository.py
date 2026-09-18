from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.finding import Finding

class FindingRepository:
    def get_by_study(self, db: Session, study_id: str) -> List[Finding]:
        return db.query(Finding).filter(Finding.study_id == study_id).order_by(Finding.confidence_score.desc()).all()

    def get_by_id(self, db: Session, finding_id: str) -> Optional[Finding]:
        return db.query(Finding).filter(Finding.id == finding_id).first()

    def create(self, db: Session, finding: Finding) -> Finding:
        db.add(finding)
        db.commit()
        db.refresh(finding)
        return finding

    def update_status(self, db: Session, finding_id: str, status: str, comment: Optional[str] = None) -> Optional[Finding]:
        f = self.get_by_id(db, finding_id)
        if f:
            f.status = status
            if comment is not None:
                f.radiologist_comment = comment
            db.commit()
            db.refresh(f)
        return f

    def delete(self, db: Session, finding_id: str) -> bool:
        f = self.get_by_id(db, finding_id)
        if f:
            db.delete(f)
            db.commit()
            return True
        return False

finding_repo = FindingRepository()
