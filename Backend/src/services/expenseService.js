import { supabase } from "../supabaseClient.js";
import { EXPENSE_CATEGORIES } from "../constants/enums.js";
/* ---------- helpers ---------- */

function isValidCategory(category) {
    return Object.values(EXPENSE_CATEGORIES).includes(category);
}

function getMonthStart(dateStr) {
    const [year, month] = dateStr.split("-");
    return `${year}-${month}-01`;
}

function inferDiscretionary(category) {
    return (
        category === EXPENSE_CATEGORIES.FOOD ||
        category === EXPENSE_CATEGORIES.SHOPPING ||
        category === EXPENSE_CATEGORIES.ENTERTAINMENT
    );
}

export async function insertExpenses(expenses ) {
    // console.log("in expense insert : ", expenses)

    if (!Array.isArray(expenses) || expenses.length === 0) {
        throw new Error("Expenses must be a non-empty array");
    }

    const rows = expenses.map((exp) => {
        const { amount, description, category, transaction_date } = exp;

        if (
            typeof amount !== "number" ||
            amount <= 0 ||
            typeof description !== "string" ||
            !transaction_date
        ) {
            throw new Error("Invalid expense entry");
        }

        if (!isValidCategory(category)) {
            throw new Error(`Invalid category: ${category}`);
        }

        return {
            amount,
            description,
            category_code: category,
            is_discretionary: inferDiscretionary(category),
            transaction_date,
            source: "manual",
        };
    });

    // Insert expenses
    const { error } = await supabase.from("expenses").insert(rows);
    if (error) throw new Error("Failed to insert expenses");

    // Aggregate by month
    const monthlyExpenseMap = {};
    for (const row of rows) {
        const month = getMonthStart(row.transaction_date);
        monthlyExpenseMap[month] =
            (monthlyExpenseMap[month] || 0) + row.amount;
    }

    // Update monthly_summary
    for (const [month, expenseDelta] of Object.entries(monthlyExpenseMap)) {

        const { data: existing } = await supabase
            .from("monthly_summary")
            .select("*")
            .eq("month", month)
            .single();

        if (!existing) {
            const derived = computeDerived(0, expenseDelta);

            await supabase.from("monthly_summary").insert({
                month,
                total_income: 0,
                total_expense: expenseDelta,
                ...derived,
                anomaly_count: 0,
            });
        } else {
            const total_expense = existing.total_expense + expenseDelta;
            const derived = computeDerived(existing.total_income, total_expense);

            await supabase
                .from("monthly_summary")
                .update({
                    total_expense,
                    ...derived,
                })
                .eq("month", month);
        }
    }

    return rows.length;
}


export async function fetchAllExpenses() {
    const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("transaction_date", { ascending: false });

    if (error) {
        console.error(error);
        throw new Error("Failed to fetch expenses");
    }

    return data;
}

export async function getExpensesByMonth(month) {
    if (!/^\d{4}-\d{2}-01$/.test(month)) {
        throw new Error("Month must be in YYYY-MM-01 format");
    }

    const startDate = month;
    const [year, m] = month.split("-");
    const endDate = new Date(year, Number(m), 0)
        .toISOString()
        .slice(0, 10); // last day of month

    const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .gte("transaction_date", startDate)
        .lte("transaction_date", endDate)
        .order("transaction_date", { ascending: false });

    if (error) {
        console.error(error);
        throw new Error("Failed to fetch expenses");
    }

    return data;
}
