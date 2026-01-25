from pydantic import BaseModel, Field
from typing import Dict, List, Optional


# =========================
# REQUEST SCHEMA
# =========================
class PredictionRequest(BaseModel):
    month: str
    income: float
    expenses: Dict[str, float]


# =========================
# RESPONSE SUB-SCHEMAS
# =========================
class MonthComparison(BaseModel):
    previous_month: Optional[str]
    previous_savings: Optional[float]
    change_rate: Optional[float]


# =========================
# RESPONSE SCHEMA
# =========================
class PredictionResponse(BaseModel):
    month: str
    income: float
    total_expense: float

    predicted_savings: float
    savings_rate: float
    expense_ratio: float

    month_comparison: MonthComparison
    category_wise_expenses: Dict[str, float]

    alerts: List[str]
    future_advice: List[str]

class AnomalyRequest(BaseModel):
    amount: float = Field(..., gt=0)
    category_code: str
    is_discretionary: int = Field(..., ge=0, le=1)
    transaction_date: str


class AnomalyResponse(BaseModel):
    suspicious: bool
    risk_score: float
    ml_score: float
    reason: str