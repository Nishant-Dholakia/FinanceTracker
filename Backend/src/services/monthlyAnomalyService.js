import { detectMonthlyAnomaliesBatch } from "./anomalyService.js";
import { getExpensesByMonth } from "./expenseService.js";


export async function detectMonthlyAnomalies(month) {
    const expenses = await getExpensesByMonth(month);

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


    const anomalies = results.filter(r => r.suspicious);

    return {
        month,
        total_expenses: expenses.length,
        anomaly_count: anomalies.length,
        anomalies,
    };
}
