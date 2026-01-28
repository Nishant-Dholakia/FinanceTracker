import fetch from "node-fetch";
import { supabase } from "../supabaseClient.js";

export async function analyzeRecommendations(month) {
    console.log(month);
    if (!/^\d{4}-\d{2}-01$/.test(month)) {
        throw new Error("Month must be YYYY-MM-01");
    }

    // 1️⃣ Fetch monthly summary
    const { data: summary } = await supabase
        .from("monthly_summary")
        .select("*")
        .eq("month", month)
        .single();

    if (!summary) {
        throw new Error("Monthly summary not found");
    }

    // 2️⃣ Fetch expenses for month
    const { data: expenses } = await supabase
        .from("expenses")
        .select("category_code, amount")
        .gte("transaction_date", month)
        .lte("transaction_date", month.slice(0, 8) + "31");

    // 3️⃣ Aggregate category-wise
    const categoryMap = {};
    for (const e of expenses) {
        categoryMap[e.category_code] =
            (categoryMap[e.category_code] || 0) + e.amount;
    }

    // 4️⃣ Build ML payload
    const payload = {
        month: month.slice(0, 7), // YYYY-MM
        income: summary.total_income,
        expenses: categoryMap,
    };

    // 5️⃣ Call Python ML service
    const response = await fetch(`${process.env.ML_API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("ML service failed");
    }

    return await response.json();
}