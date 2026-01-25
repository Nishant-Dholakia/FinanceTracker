from fastapi import FastAPI
from app.schemas import (
    PredictionRequest,
    PredictionResponse,
    AnomalyRequest,
    AnomalyResponse
)
from app.predictor import run_prediction
from app.anomaly_predictor import detect_anomaly

app = FastAPI(title="Financial ML Service")

@app.post("/predict", response_model=PredictionResponse)
def predict(data: PredictionRequest):
    return run_prediction(
        month=data.month,
        income=data.income,
        expenses=data.expenses
    )

@app.post("/anomaly-detect", response_model=AnomalyResponse)
def anomaly_detect(data: AnomalyRequest):
    return detect_anomaly(data.dict())
