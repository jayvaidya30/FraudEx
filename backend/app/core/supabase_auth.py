from __future__ import annotations

import time
from dataclasses import dataclass

import httpx
from fastapi import Header, HTTPException, status
from jose import jwt, jwk

from app.core.config import settings


@dataclass(frozen=True)
class CurrentUser:
    id: str
    email: str | None
    role: str | None
    raw_claims: dict


_JWKS_CACHE: dict[str, object] = {"fetched_at": 0.0, "jwks": None}
_JWKS_TTL_SECONDS = 10 * 60


async def _get_jwks() -> dict:
    jwks_url = settings.supabase_jwks_url
    if not jwks_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase auth is not configured (SUPABASE_URL missing)",
        )

    now = time.time()
    cached_jwks = _JWKS_CACHE.get("jwks")
    cached_at = float(_JWKS_CACHE.get("fetched_at") or 0.0)
    if cached_jwks and now - cached_at < _JWKS_TTL_SECONDS:
        return cached_jwks  # type: ignore[return-value]

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(jwks_url)
        response.raise_for_status()
        jwks = response.json()

    _JWKS_CACHE["jwks"] = jwks
    _JWKS_CACHE["fetched_at"] = now
    return jwks


def _extract_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")
    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1].strip():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Authorization header")
    return parts[1].strip()


async def get_current_user(authorization: str | None = Header(default=None)) -> CurrentUser:
    token = _extract_bearer_token(authorization)

    try:
        header = jwt.get_unverified_header(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token header")

    kid = header.get("kid")
    if not kid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing kid")

    jwks = await _get_jwks()
    keys = jwks.get("keys") or []
    jwk_dict = next((k for k in keys if k.get("kid") == kid), None)
    if not jwk_dict:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unknown signing key")

    try:
        key = jwk.construct(jwk_dict)
        public_pem = key.to_pem().decode("utf-8")
        claims = jwt.decode(
            token,
            public_pem,
            algorithms=settings.supabase_jwt_algorithms,
            audience=settings.supabase_jwt_audience,
            options={"verify_aud": True},
        )
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token verification failed")

    return CurrentUser(
        id=str(claims.get("sub") or ""),
        email=claims.get("email"),
        role=claims.get("role"),
        raw_claims=claims,
    )
