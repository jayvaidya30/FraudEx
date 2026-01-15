from __future__ import annotations

from fastapi import Depends, Header, HTTPException, status

from app.core.supabase_auth import CurrentUser, get_current_user


def require_user(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    return user


def get_access_token(authorization: str | None = Header(default=None)) -> str:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")
    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1].strip():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Authorization header")
    return parts[1].strip()
