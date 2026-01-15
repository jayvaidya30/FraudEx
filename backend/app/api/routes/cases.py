from __future__ import annotations

from typing import Any
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.api.deps import get_access_token, require_user
from app.core.supabase_auth import CurrentUser
from app.services import explainability, llm_gemini, moderation, risk_scoring, text_extraction
from app.services import storage
from app.services.supabase_postgrest import SupabasePostgrest

router = APIRouter()


@router.get("", response_model=list[dict])
async def list_cases(
    *,
    _: CurrentUser = Depends(require_user),
    access_token: str = Depends(get_access_token),
) -> Any:
    """List cases for the current user.

    Row Level Security in Supabase restricts this to the authenticated user's cases.
    """
    client = SupabasePostgrest(access_token=access_token)
    rows = await client.get(
        "/cases",
        params={
            "select": "case_id,status,risk_score,explanation,signals,created_at",
            "order": "created_at.desc",
        },
    )
    return rows or []


@router.post("/upload", response_model=dict)
async def upload_case_document(
    *,
    _: CurrentUser = Depends(require_user),
    access_token: str = Depends(get_access_token),
    file: UploadFile = File(...),
) -> Any:
    """
    Upload a document to create a new case.
    """
    file_path = storage.save_upload(file)
    case_id = str(uuid4())

    client = SupabasePostgrest(access_token=access_token)
    created = await client.post(
        "/cases",
        json={
            "case_id": case_id,
            "status": "uploaded",
            "signals": {"original_file": file_path, "filename": file.filename},
        },
    )

    return {"case": created}


@router.get("/{case_id}", response_model=dict)
async def get_case(
    case_id: str,
    _: CurrentUser = Depends(require_user),
    access_token: str = Depends(get_access_token),
) -> Any:
    """
    Get case details by ID.
    User can only see their own cases? Or open? SRS says Agent/Journalist... 
    For MVP let's restrict to owner or admin.
    """
    client = SupabasePostgrest(access_token=access_token)
    rows = await client.get(
        "/cases",
        params={
            "select": "case_id,status,risk_score,explanation,signals,created_at",
            "case_id": f"eq.{case_id}",
        },
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Case not found")
    return rows[0]


@router.post("/{case_id}/analyze", response_model=dict)
async def analyze_case(
    *,
    case_id: str,
    _: CurrentUser = Depends(require_user),
    access_token: str = Depends(get_access_token),
) -> Any:
    """Run the analysis pipeline for an uploaded case and persist results."""
    client = SupabasePostgrest(access_token=access_token)
    rows = await client.get(
        "/cases",
        params={
            "select": "case_id,status,risk_score,explanation,signals,created_at",
            "case_id": f"eq.{case_id}",
        },
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Case not found")

    case = rows[0]
    signals = case.get("signals") or {}
    file_path = signals.get("original_file")
    if not file_path:
        raise HTTPException(status_code=400, detail="Case has no uploaded file")

    text = text_extraction.extract_text(file_path)
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from uploaded file")

    score, computed_signals, _heuristic_explanation = risk_scoring.compute_risk_score(text)
    llm_analysis = llm_gemini.analyze_document(text)
    if llm_analysis and not moderation.check_content_safety(llm_analysis):
        llm_analysis = "⚠️ AI analysis hidden due to safety policy (unsupported accusations or unsafe content)."

    formatted_explanation = explainability.format_explanation(computed_signals, llm_analysis)
    final_output = moderation.sanitize_output(formatted_explanation)

    merged_signals = {**signals, **computed_signals}
    merged_signals["extracted_text_preview"] = text[:500]

    updated = await client.patch(
        "/cases",
        params={"case_id": f"eq.{case_id}"},
        json={
            "status": "analyzed",
            "risk_score": int(score),
            "signals": merged_signals,
            "explanation": final_output,
        },
    )

    # Supabase returns a list for return=representation
    updated_case = updated[0] if isinstance(updated, list) and updated else updated
    return {"case": updated_case}
