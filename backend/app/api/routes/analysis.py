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


@router.post("/{case_id}/analyze", response_model=dict)
def analyze_case(
    case_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Trigger analysis for a specific case.
    """
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Permission check
    if case.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    if not case.signals:
        case.signals = {}

    # 1. Extract Text
    file_path = case.signals.get("original_file")
    if not file_path:
        return {"error": "No file path found for case"}
    
    text = text_extraction.extract_text(file_path)
    if not text:
        return {"error": "Could not extract text or file empty"}

    # 2. Heuristic Scoring
    score, signals, explanation_heuristic = risk_scoring.compute_risk_score(text)
    
    # 3. LLM Analysis
    llm_analysis = llm_gemini.analyze_document(text)
    
    # 4. Moderation Check (on LLM output)
    if not moderation.check_content_safety(llm_analysis):
        llm_analysis = "⚠️ Analysis hidden due to potential policy violation (e.g. unsupported accusations)."

    # 5. Format Explanation
    formatted_explanation = explainability.format_explanation(signals, llm_analysis)
    
    # 6. Sanitize Final Output
    final_output = moderation.sanitize_output(formatted_explanation)

    # 7. Update Case
    case.risk_score = score
    case.signals.update(signals)
    case.signals["extracted_text_preview"] = text[:200]
    case.explanation = final_output
    case.status = "analyzed"
    
    db.commit()
    db.refresh(case)

    return {
        "status": "success",
        "risk_score": case.risk_score,
        "explanation": case.explanation
    }
