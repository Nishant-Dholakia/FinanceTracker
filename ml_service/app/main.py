from http.client import HTTPException
from fastapi import FastAPI
from app.schemas import (
    AnomalyBatchRequest,
    AnomalyBatchResponse,
    PredictionRequest,
    PredictionResponse,
)
from app.predictor import run_prediction
from app.anomaly_predictor import detect_anomaly

app = FastAPI(title="Financial ML Service")

@app.get("/health")
def health():
    return {"status": "health ok"}

@app.get("/")
def root():
    return {"status": "root ok"}

@app.post("/predict", response_model=PredictionResponse)
def predict(data: PredictionRequest):
    return run_prediction(
        month=data.month,
        income=data.income,
        expenses=data.expenses
    )

MAX_BATCH_SIZE = 500


@app.post(
    "/anomaly-detect-batch",
    response_model=AnomalyBatchResponse
)
def anomaly_detect_batch(data: AnomalyBatchRequest):

    if len(data.expenses) > MAX_BATCH_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Batch size too large"
        )

    results = []

    for expense in data.expenses:
        try:
            prediction = detect_anomaly(expense.dict())
            results.append({
                "id": expense.id,
                **prediction
            })
        except Exception as e:
            results.append({
                "id": expense.id,
                "suspicious": False,
                "risk_score": 0.0,
                "ml_score": 0.0,
                "reason": f"prediction_failed: {str(e)}"
            })

    return {"results": results}
