from fastapi import APIRouter, Depends

from app.api.deps import require_user
from app.core.supabase_auth import CurrentUser

router = APIRouter()


@router.get("/me")
def me(user: CurrentUser = Depends(require_user)):
    return {"id": user.id, "email": user.email, "role": user.role}
