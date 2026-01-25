from app.model_loader import (
    anomaly_model,
    anomaly_encoder,
    category_stats,
    known_categories
)
import numpy as np
import pandas as pd


def detect_anomaly(expense: dict):
    category = expense["category_code"]

    if category not in known_categories:
        return {
            "suspicious": False,
            "risk_score": 0.0,
            "ml_score": 0.0,
            "reason": "unknown category"
        }

    amount = float(expense["amount"])
    is_discretionary = int(expense["is_discretionary"])
    date = pd.to_datetime(expense["transaction_date"])

    log_amount = np.log1p(amount)
    category_encoded = anomaly_encoder.transform([category])[0]
    day_of_week = date.weekday()

    X = [[
        log_amount,
        category_encoded,
        is_discretionary,
        day_of_week
    ]]

    ml_score = float(anomaly_model.decision_function(X)[0])
    ml_risk = max(0.0, 1 - (ml_score + 0.5))

    # Statistical deviation
    stats = category_stats[category]
    deviation_risk = 0.0
    reasons = []

    if amount > stats["p95"]:
        deviation_risk += 0.6
        reasons.append("amount is in top 5% for this category")
    elif amount > stats["p90"]:
        deviation_risk += 0.4
        reasons.append("amount is unusually high for this category")

    ratio = amount / max(stats["median"], 1.0)

    if ratio > 3:
        deviation_risk += 0.6
        reasons.append(f"spend is {ratio:.1f}× higher than usual")
    elif ratio > 2:
        deviation_risk += 0.4
        reasons.append(f"spend is {ratio:.1f}× higher than usual")

    deviation_risk = min(deviation_risk, 1.0)

    # Final score
    final_score = (0.4 * ml_risk) + (0.6 * deviation_risk)
    suspicious = final_score >= 0.5

    if suspicious and not reasons:
        reasons.append("rare spending pattern compared to past behavior")

    return {
        "suspicious": suspicious,
        "risk_score": round(final_score, 3),
        "ml_score": round(ml_score, 4),
        "reason": " & ".join(reasons) if reasons else "within normal behavior"
    }
