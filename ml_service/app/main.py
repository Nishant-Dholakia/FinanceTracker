from fastapi import FastAPI
from app.schemas import PredictionRequest, PredictionResponse
from app.predictor import run_prediction

app = FastAPI(title="Financial ML Service")

@app.post("/predict", response_model=PredictionResponse)
def predict(data: PredictionRequest):
    return run_prediction(
        month=data.month,
        income=data.income,
        expenses=data.expenses
    )
