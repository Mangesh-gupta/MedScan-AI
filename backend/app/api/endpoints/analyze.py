from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.analysis_service import analysis_service

router = APIRouter()

@router.post("/{study_id}")
def analyze_study(study_id: str, db: Session = Depends(get_db)):
    try:
        result = analysis_service.run_study_analysis(db, study_id)
        
        # Format paths for web consumption
        if result.get("heatmap_path"):
            hp = Path(result["heatmap_path"]).name
            result["heatmap_url"] = f"/static/uploads/{hp}"
        if result.get("segmentation_mask_path"):
            mp = Path(result["segmentation_mask_path"]).name
            result["segmentation_mask_url"] = f"/static/uploads/{mp}"
            
        return {
            "success": True,
            "message": "AI Copilot analysis completed successfully",
            "data": result
        }
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis pipeline error: {str(e)}")
