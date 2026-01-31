from fastapi import FastAPI, Header, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse
import os

from app.schemas import (
    AnomalyBatchRequest,
    AnomalyBatchResponse,
    PredictionRequest,
    PredictionResponse,
)
from app.predictor import run_prediction
from app.anomaly_predictor import detect_anomaly

# ------------------
# CONFIG
# ------------------
API_KEY = os.getenv("API_KEY", "dev-secret-key")
MAX_BATCH_SIZE = 500

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Financial ML Service",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

app.state.limiter = limiter

# ------------------
# RATE LIMIT HANDLER
# ------------------
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded"},
    )

# ------------------
# AUTH
# ------------------
def verify_key(x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")

# ------------------
# HEALTH
# ------------------
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"status": "alive"}

# ------------------
# PREDICTION
# ------------------
@app.post("/predict", response_model=PredictionResponse)
@limiter.limit("10/minute")
def predict(
    data: PredictionRequest,
    x_api_key: str = Header(None),
):
    verify_key(x_api_key)

    return run_prediction(
        month=data.month,
        income=data.income,
        expenses=data.expenses,
    )

# ------------------
# ANOMALY BATCH
# ------------------
@app.post(
    "/anomaly-detect-batch",
    response_model=AnomalyBatchResponse,
)
@limiter.limit("3/minute")
def anomaly_detect_batch(
    data: AnomalyBatchRequest,
    x_api_key: str = Header(None),
):
    verify_key(x_api_key)

    if len(data.expenses) > MAX_BATCH_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Batch size too large",
        )

    results = []

    for expense in data.expenses:
        try:
            prediction = detect_anomaly(expense.dict())
            results.append(
                {
                    "id": expense.id,
                    **prediction,
                }
            )
        except Exception as e:
            results.append(
                {
                    "id": expense.id,
                    "suspicious": False,
                    "risk_score": 0.0,
                    "ml_score": 0.0,
                    "reason": f"prediction_failed: {str(e)}",
                }
            )

    return {"results": results}