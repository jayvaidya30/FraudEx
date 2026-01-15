from pydantic import BaseModel


class CaseCreateResponse(BaseModel):
    case_id: str


class CaseResult(BaseModel):
    case_id: str
    status: str
    risk_score: int | None = None
    signals: dict | None = None
    explanation: str | None = None
