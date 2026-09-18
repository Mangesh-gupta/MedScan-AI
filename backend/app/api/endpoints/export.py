from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.export_service import export_service

router = APIRouter()

@router.get("/{report_id}/pdf")
def export_pdf(report_id: str, db: Session = Depends(get_db)):
    try:
        pdf_path = export_service.export_report_pdf(db, report_id)
        return FileResponse(
            path=pdf_path,
            filename=Path(pdf_path).name,
            media_type="application/pdf"
        )
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

@router.get("/{report_id}/docx")
def export_docx(report_id: str, db: Session = Depends(get_db)):
    try:
        docx_path = export_service.export_report_docx(db, report_id)
        return FileResponse(
            path=docx_path,
            filename=Path(docx_path).name,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DOCX generation failed: {str(e)}")
