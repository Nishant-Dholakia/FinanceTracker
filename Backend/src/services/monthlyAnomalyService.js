import { getExpensesByMonth } from "./expenseService.js";
import { detect_anomaly } from "./anomalyService.js";

export async function detectMonthlyAnomalies(month) {
    const expenses = await getExpensesByMonth(month);

    const anomalies = [];
    const failed = [];

    for (const expense of expenses) {
        try {
            const result = await detect_anomaly({
                amount: expense.amount,
                category_code: expense.category_code,
                is_discretionary: expense.is_discretionary,
                transaction_date: expense.transaction_date,
            });

            if (result.suspicious) {
                anomalies.push({
                    expense_id: expense.id,
                    ...result,
                });
            }
        } catch (err) {
            failed.push({
                expense_id: expense.id,
                error: err.message,
            });
        }
    }

    return {
        month,
        total_expenses: expenses.length,
        anomaly_count: anomalies.length,
        anomalies,
        failed, // optional, useful for debugging
    };
}
