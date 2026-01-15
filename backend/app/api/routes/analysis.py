from typing import Any

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.api import deps
from app.models.case import Case
from app.models.user import User
from app.services import text_extraction, risk_scoring, llm_gemini, moderation, explainability

router = APIRouter()


def run_analysis_task(case_id: str, db_session: Session):
    """
    Background task to run full analysis pipeline.
    """
    # Create a new session or use logic carefully. 
    # For background tasks, passing db session is tricky if it closes. 
    # Better to create new session here, but for simplicity/MVP let's assume scoped session works or we re-fetch.
    # Actually, standard practice: create new session inside task.
    # But since I didn't set up a separate task worker, let's just do it synchronously in the request for MVP 
    # OR simpler: just do it synchronously if files are small.
    # The requirement says "Analysis response <= 10 seconds (MVP)".
    # Let's try synchronous for MVP.
    pass


@router.post("/{case_id}/analyze", response_model=dict, status_code=202)
def analyze_case(
    case_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Trigger analysis for a specific case (Async).
    """
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Permission check
    if case.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Update status to queued
    case.status = "queued"
    db.commit()

    # Trigger background task
    from app.services.analysis_pipeline import run_analysis_pipeline
    background_tasks.add_task(run_analysis_pipeline, case_id)

    return {
        "status": "queued",
        "case_id": case_id,
        "message": "Analysis started in background."
    }
