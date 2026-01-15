from __future__ import annotations

from typing import Any
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.api.deps import get_access_token, require_user
from app.core.supabase_auth import CurrentUser
from app.services import storage
from app.services.supabase_postgrest import SupabasePostgrest

router = APIRouter()


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
