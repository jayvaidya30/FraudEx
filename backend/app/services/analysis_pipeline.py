from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.case import Case
from app.services import text_extraction, risk_scoring, llm_gemini, moderation, explainability
import logging

logger = logging.getLogger(__name__)

def run_analysis_pipeline(case_id: str) -> None:
    """
    Background task to run full analysis pipeline.
    Creates its own DB session.
    """
    db = SessionLocal()
    try:
        case = db.query(Case).filter(Case.case_id == case_id).first()
        if not case:
            logger.error(f"Case {case_id} not found during background analysis")
            return

        # Update status to processing
        case.status = "processing"
        db.commit()

        if not case.signals:
            case.signals = {}

        # 1. Extract Text
        file_path = case.signals.get("original_file")
        if not file_path:
            case.status = "failed"
            case.explanation = "No file path found."
            db.commit()
            return
        
        text = text_extraction.extract_text(file_path)
        if not text:
            case.status = "failed"
            case.explanation = "Could not extract text or file empty."
            db.commit()
            return

        # 2. Heuristic Scoring
        score, signals, explanation_heuristic = risk_scoring.compute_risk_score(text)
        
        # 3. LLM Analysis
        llm_analysis = llm_gemini.analyze_document(text)
        
        # 4. Moderation Check
        if not moderation.check_content_safety(llm_analysis):
            llm_analysis = "⚠️ Analysis hidden due to potential policy violation."

        # 5. Format Explanation
        formatted_explanation = explainability.format_explanation(signals, llm_analysis)
        
        # 6. Sanitize
        final_output = moderation.sanitize_output(formatted_explanation)

        # 7. Update Case
        case.risk_score = score
        case.signals.update(signals)
        case.signals["extracted_text_preview"] = text[:200]
        case.explanation = final_output
        case.status = "analyzed"
        
        db.commit()
        logger.info(f"Analysis completed for case {case_id}")

    except Exception as e:
        logger.error(f"Analysis failed for case {case_id}: {e}")
        # Need to re-fetch case in case of session issues, but simpler here:
        try:
            case.status = "failed"
            case.explanation = f"Internal error during analysis: {str(e)}"
            db.commit()
        except:
            pass
    finally:
        db.close()
