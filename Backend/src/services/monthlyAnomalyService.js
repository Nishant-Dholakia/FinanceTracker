import { detectMonthlyAnomaliesBatch } from "./anomalyService.js";
import { getExpensesByMonth } from "./expenseService.js";

export async function detectMonthlyAnomalies(month) {
    const expenses = await getExpensesByMonth(month);

    // Build ML payload
    const payload = expenses.map(e => ({
        id: String(e.id),
        amount: Number(e.amount),
        category_code: String(e.category_code),
        is_discretionary: e.is_discretionary ? 1 : 0,
        transaction_date: String(e.transaction_date),
    }));

    let results = [];

    try {
        const res = await detectMonthlyAnomaliesBatch(payload);
        results = res.results;
    } catch (err) {
        console.error("ML batch failed:", err.message);
        results = [];
    }

    // 🔑 Build lookup map from ML results
    const mlMap = new Map();
    for (const r of results) {
        mlMap.set(String(r.id), r);
    }

    // ✅ Merge expense + ML data (THIS IS WHAT FRONTEND NEEDS)
    const merged = expenses.map(e => {
        const ml = mlMap.get(String(e.id));

        return {
            id: String(e.id),
            amount: Number(e.amount),
            category_code: e.category_code ?? "UNKNOWN",
            transaction_date: e.transaction_date,
            is_discretionary: Boolean(e.is_discretionary),

            suspicious: ml?.suspicious ?? false,
            risk_score: ml?.risk_score ?? 0,
            ml_score: ml?.ml_score ?? 0,
            reason: ml?.reason ?? "not analyzed",
        };
    });

    const anomalies = merged.filter(e => e.suspicious);

    return {
        month,
        total_expenses: expenses.length,
        anomaly_count: anomalies.length,
        anomalies,
    };
}
