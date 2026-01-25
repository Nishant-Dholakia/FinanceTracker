import pickle
import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# --------------------------------------------------
# Savings model (simple pickle is OK)
# --------------------------------------------------

SAVINGS_MODEL_PATH = BASE_DIR / "models" / "savings_model.pkl"

with open(SAVINGS_MODEL_PATH, "rb") as f:
    savings_model = pickle.load(f)

# --------------------------------------------------
# Anomaly model bundle (joblib)
# --------------------------------------------------

ANOMALY_MODEL_PATH = BASE_DIR / "models" / "anomaly_bundle.joblib"

bundle = joblib.load(ANOMALY_MODEL_PATH)

anomaly_model = bundle["model"]
anomaly_encoder = bundle["encoder"]
category_stats = bundle["category_stats"]
known_categories = set(bundle["known_categories"])

print("Anomaly model loaded:", type(anomaly_model))
print("Known categories:", len(known_categories))
