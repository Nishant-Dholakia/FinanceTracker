import pandas as pd
from app.model_loader import model

# =========================
# LOAD CSV
# =========================
df = pd.read_csv("data/monthly_summary.csv")
df["month"] = pd.to_datetime(df["month"], errors="coerce")
df = df.dropna(subset=["month"])
df = df.sort_values("month")


def run_prediction(month: str, income: float, expenses: dict):

    current_month = pd.to_datetime(month)
    df_valid = df[df["month"] <= current_month]

    # =========================
    # CURRENT MONTH
    # =========================
    total_expense = sum(expenses.values())
    expense_ratio = round((total_expense / income) * 100, 2)

    input_df = pd.DataFrame(
        [[income, expense_ratio]],
        columns=["total_income", "expense_ratio"]
    )

    predicted_savings = float(model.predict(input_df)[0])
    predicted_savings = round(
        max(0, min(predicted_savings, income)), 2
    )

    savings_rate = round((predicted_savings / income) * 100, 2)

    # =========================
    # PREVIOUS MONTH COMPARISON
    # =========================
    previous_month = None
    previous_savings = None
    change_rate = None

    prev_data = df_valid[df_valid["month"] < current_month]

    if not prev_data.empty:
        prev_row = prev_data.iloc[-1]
        previous_month = prev_row["month"].strftime("%Y-%m")
        previous_savings = round(prev_row["savings"], 2)

        change_rate = round(
            ((predicted_savings - previous_savings)
             / previous_savings) * 100,
            1
        )

    # =========================
    # CATEGORY EXPENSES
    # =========================
    category_expenses = expenses.copy()

    expense_df = pd.DataFrame(
        list(expenses.items()),
        columns=["category", "amount"]
    )

    expense_df["contribution_pct"] = (
        expense_df["amount"] / total_expense * 100
    )

    # =========================
    # ALERT ENGINE (MATCH COLAB)
    # =========================
    alerts = []

    # Savings trend alerts
    if change_rate is not None:
        hist_change = (
            df_valid["savings"].pct_change().dropna() * 100
        )

        decline_threshold = hist_change.quantile(0.25)
        growth_threshold = hist_change.quantile(0.75)

        if change_rate < decline_threshold:
            alerts.append("⚠️ Savings trend weaker than usual")
        elif change_rate > growth_threshold:
            alerts.append("✅ Savings improving better than usual")

    # High spending concentration alerts
    high_threshold = expense_df["contribution_pct"].quantile(0.75)

    for _, row in expense_df.iterrows():
        if row["contribution_pct"] > high_threshold:
            alerts.append(
                f"⚠️ High spending concentration in {row['category'].title()}"
            )

    # Expense ratio alert
    hist_ratio = df_valid["expense_ratio"]

    if expense_ratio > hist_ratio.quantile(0.75):
        alerts.append("⚠️ Expense ratio higher than your usual pattern")
    elif expense_ratio < hist_ratio.quantile(0.25):
        alerts.append("✅ Expense ratio better than your usual pattern")

    # =========================
    # FUTURE GUIDANCE (DATA-DRIVEN)
    # =========================
    future_advice = []

    expense_changes = hist_ratio.diff().dropna()
    reductions = expense_changes[expense_changes < 0].abs()

    if not reductions.empty:
        avg_reduction = reductions.mean()
        improved_ratio = max(0, expense_ratio - avg_reduction)

        future_input = pd.DataFrame(
            [[income, improved_ratio]],
            columns=["total_income", "expense_ratio"]
        )

        improved_savings = model.predict(future_input)[0]
        improvement = round(
            improved_savings - predicted_savings, 2
        )

        if improvement > 0:
            future_advice.append(
                f"📌 Historically achievable reduction could improve savings by approx ₹{improvement}"
            )

    # Top expense contributors
    top_categories = expense_df.sort_values(
        "contribution_pct", ascending=False
    ).head(2)

    for _, row in top_categories.iterrows():
        future_advice.append(
            f"📌 '{row['category'].title()}' drives {round(row['contribution_pct'],1)}% of expenses — optimizing it has high impact"
        )

    # Savings target from history
    hist_savings_rate = (
        df_valid["savings"] / df_valid["total_income"] * 100
    )

    target_rate = round(hist_savings_rate.quantile(0.75), 1)

    future_advice.append(
        f"📌 Aim for a savings rate around {target_rate}% based on your strongest past months"
    )

    # =========================
    # FINAL RESPONSE
    # =========================
    return {
        "month": current_month.strftime("%Y-%m"),
        "income": income,
        "total_expense": total_expense,
        "predicted_savings": predicted_savings,
        "savings_rate": savings_rate,
        "expense_ratio": expense_ratio,

        "month_comparison": {
            "previous_month": previous_month,
            "previous_savings": previous_savings,
            "change_rate": change_rate
        },

        "category_wise_expenses": category_expenses,
        "alerts": alerts,
        "future_advice": future_advice
    }
