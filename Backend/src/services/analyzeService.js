import { supabase } from "../supabaseClient.js";
import {
    computeFinanceMetrics,
    computeCategoryBreakdown,
} from "./financeRules.js";
import {
    detectAnomalies,
    forecastSavings,
} from "./mlClient.js";

export async function analyzeData() {
    // 1. Fetch all expenses
    const { data: expenses, error } = await supabase
        .from("expenses")
        .select("*");

    if (error) {
        console.error(error);
        throw new Error("Failed to fetch expenses");
    }

    if (!expenses || expenses.length === 0) {
        throw new Error("No expenses found");
    }

    // TEMP income (hackathon-safe)
    const income = 85000;

    // 2. Finance rules
    const financeMetrics = computeFinanceMetrics(income, expenses);
    const categoryBreakdown = computeCategoryBreakdown(expenses);

    // 3. ML signals
    const anomalies = await detectAnomalies(expenses);
    const forecast = await forecastSavings();

    // 4. Score (rule-based)
    let scoreValue = 100;
    scoreValue -= financeMetrics.expenseRatio * 0.4;
    scoreValue -= anomalies.length * 5;

    scoreValue = Math.max(0, Math.round(scoreValue));

    const risk =
        scoreValue >= 70
            ? "LOW"
            : scoreValue >= 40
                ? "MODERATE"
                : "HIGH";

    // 5. Recommendations
    const recommendations = [];

    if (financeMetrics.savingsRate < 20) {
        recommendations.push(
            "Increase monthly savings by reducing discretionary spending"
        );
    }

    if (anomalies.length > 0) {
        recommendations.push(
            "Review high-value transactions flagged as unusual"
        );
    }

    return {
        financeMetrics,
        categoryBreakdown,
        anomalies,
        forecast,
        score: {
            value: scoreValue,
            risk,
            reasons: recommendations,
        },
        recommendations,
    };
}
