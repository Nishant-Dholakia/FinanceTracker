import { supabase } from "../supabaseClient.js";


function isValidMonth(month) {
    return /^\d{4}-\d{2}-01$/.test(month);
}

function computeDerived(total_income, total_expense) {
    // If no income yet, derived metrics are undefined → clamp to 0
    if (total_income <= 0) {
        return {
            savings: 0,
            savings_rate: 0,
            expense_ratio: 0,
        };
    }

    const savings = total_income - total_expense;

    return {
        savings,
        savings_rate: +( (savings / total_income) * 100 ).toFixed(2),
        expense_ratio: +( (total_expense / total_income) * 100 ).toFixed(2),
    };
}

export async function insertIncome({ amount, month }) {
    // just to add again
    if (typeof amount !== "number" || amount <= 0) {
        throw new Error("Invalid income amount");
    }

    if (!isValidMonth(month)) {
        throw new Error("Month must be YYYY-MM-01");
    }

    const { data: existing } = await supabase
        .from("monthly_summary")
        .select("*")
        .eq("month", month)
        .single();

    if (!existing) {
        const derived = computeDerived(amount, 0);

        await supabase.from("monthly_summary").insert({
            month,
            total_income: amount,
            total_expense: 0,
            ...derived,
            anomaly_count: 0,
        });
    } else {
        const total_income = existing.total_income + amount;
        const derived = computeDerived(total_income, existing.total_expense);

        await supabase
            .from("monthly_summary")
            .update({
                total_income,
                ...derived,
            })
            .eq("month", month);
    }

    return { status: "success" };
}

