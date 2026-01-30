# FinTrak – Smart Personal Finance Analyzer

FinTrak is a full-stack personal finance analysis platform that combines **rule-based finance logic** with **machine learning** to help users understand spending behavior, detect anomalies, and gain actionable financial insights. The project is designed to be hackathon-friendly, fast to deploy, and easy to explain.

---

## 🚀 What Problem Does It Solve?

People track expenses but rarely understand **what’s abnormal**, **where money leaks**, or **how spending compares month-to-month**.

FinTrak:

* Detects unusual or risky spending patterns
* Highlights discretionary vs essential expense behavior
* Helps users make smarter budgeting decisions using data, not guesswork

---

## 🧠 Core Idea

> **Rules for correctness, ML for intelligence**

* **Rules** handle financial sanity checks (thresholds, ratios, categories)
* **Machine Learning** detects anomalies and hidden patterns in expenses

This avoids ML overkill while still delivering intelligent insights.

---

## 🏗️ System Architecture

```
User
 ↓
Frontend (React Dashboard)
 ↓
Backend API (Node.js / Express)
 ↓
Finance Rules Engine
 ↓
ML Service (Python / FastAPI)
 ↓
Insights & Anomaly Scores
 ↓
Frontend Visualizations
```

---

## 🛠️ Tech Stack

### Frontend

* React
* Tailwind CSS / Shadcn UI
* Chart.js / Recharts

### Backend

* Node.js
* Express.js
* REST APIs

### Machine Learning Service

* Python
* FastAPI
* Scikit-learn

### ML Models Used (Minimal & Purposeful)

* Isolation Forest – spending anomaly detection
* Statistical thresholds – backup validation

---

## 📊 Key Features

* Monthly expense aggregation
* Category-wise spending breakdown
* Discretionary vs essential expense tagging
* ML-based anomaly detection per month
* Risk flags for unusual spikes
* Clean dashboard visualizations

---


## ⚙️ How It Works (Step-by-Step)

1. User inputs income and expenses
2. Backend validates and categorizes data
3. Finance rules calculate ratios and limits
4. Expense data sent to ML service
5. ML model detects anomalies
6. Insights returned to frontend
7. Dashboard renders charts and alerts

---

🌍 Live Demo

Frontend Dashboard: https://fintrak-nighthawks.vercel.app/dashboard

## 🧪 Running the Project Locally

### Backend (Node.js)

```bash
cd backend
npm install
npm run dev
```

### ML Service (FastAPI)

#### (Optional) Create & Activate Virtual Environment

```bash
cd ml-service
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

#### Install Dependencies & Run Server

````bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload
````

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Deployment Notes

* Backend: Render 
* ML Service: Render
* Frontend: Vercel

> Public ML endpoints may hit rate limits or protection layers (e.g. Cloudflare).

---

## ⚠️ Challenges Faced

* ML endpoint rate-limiting (HTTP 429 errors)
* Service-to-service communication latency
* Choosing minimal ML models under time constraints

**Solution:**

* Restarting ml_service on render if rate limit occurs. ( All advices accepted to improve it )
* Reduced payload size
* Used lightweight, explainable models

---

## 📌 Future Improvements

* User authentication
* Historical trend comparison
* Personalized budgeting suggestions
* Credit score integration
* Real bank transaction ingestion
---
