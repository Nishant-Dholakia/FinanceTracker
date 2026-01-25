import { supabase } from "../supabaseClient.js";
import { EXPENSE_CATEGORIES } from "../constants/enums.js";

/* ---------- helpers ---------- */

function isValidCategory(category) {
    return Object.values(EXPENSE_CATEGORIES).includes(category);
}

function inferDiscretionary(category) {
    return (
        category === EXPENSE_CATEGORIES.FOOD ||
        category === EXPENSE_CATEGORIES.SHOPPING ||
        category === EXPENSE_CATEGORIES.ENTERTAINMENT
    );
}

function getMonthStart(dateStr) {
    // expects YYYY-MM-DD
    const [year, month] = dateStr.split("-");
    return `${year}-${month}-01`;
}

function computeDerived(total_income, total_expense) {
    const savings = total_income - total_expense;

    const savings_rate =
        total_income > 0 ? (savings / total_income) * 100 : 0;

    const expense_ratio =
        total_income > 0 ? (total_expense / total_income) * 100 : 0;

    return {
        savings,
        savings_rate,
        expense_ratio,
    };
}

/* ---------- main service ---------- */

export async function insertExpenses(expenses) {

    if (!Array.isArray(expenses) || expenses.length === 0) {
        throw new Error("Expenses must be a non-empty array");
    }

    /* 1️⃣ Normalize & validate input */
    const rows = expenses.map((exp) => {
        const { amount, description, category, transaction_date } = exp;

        if (
            typeof amount !== "number" ||
            amount <= 0 ||
            typeof description !== "string" ||
            description.trim() === "" ||
            typeof category !== "string" ||
            typeof transaction_date !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(transaction_date)
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

    /* 2️⃣ Insert expenses (source of truth) */
    const { error: insertError } = await supabase
        .from("expenses")
        .insert(rows);

    if (insertError) {
        console.error(insertError);
        throw new Error("Failed to insert expenses");
    }

    /* 3️⃣ Aggregate expenses by month */
    const monthlyExpenseMap = {};
    for (const row of rows) {
        const month = getMonthStart(row.transaction_date);
        monthlyExpenseMap[month] =
            (monthlyExpenseMap[month] || 0) + Number(row.amount);
    }

    /* 4️⃣ Update monthly_summary (derived data) */
    for (const [month, expenseDelta] of Object.entries(monthlyExpenseMap)) {

        const { data: summaries, error: fetchError } = await supabase
            .from("monthly_summary")
            .select("*")
            .eq("month", month);

        if (fetchError) {
            console.error(fetchError);
            throw new Error("Failed to fetch monthly summary");
        }

        // CASE 1: Month does not exist → create new summary
        if (!summaries || summaries.length === 0) {
            const derived = computeDerived(0, expenseDelta);

            const { error } = await supabase
                .from("monthly_summary")
                .insert({
                    month,
                    total_income: 0,
                    total_expense: expenseDelta,
                    savings: derived.savings,
                    savings_rate: derived.savings_rate,
                    expense_ratio: derived.expense_ratio,
                    anomaly_count: 0,
                });

            if (error) {
                console.error(error);
                throw new Error("Failed to create monthly summary");
            }

            continue;
        }

        // CASE 2: Month exists → update totals
        const existing = summaries[0];

        const prevExpense = Number(existing.total_expense) || 0;
        const prevIncome = Number(existing.total_income) || 0;

        const total_expense = prevExpense + expenseDelta;
        const derived = computeDerived(prevIncome, total_expense);

        const { error } = await supabase
            .from("monthly_summary")
            .update({
                total_expense,
                savings: derived.savings,
                savings_rate: derived.savings_rate,
                expense_ratio: derived.expense_ratio,
            })
            .eq("month", month);

        if (error) {
            console.error(error);
            throw new Error("Failed to update monthly summary");
        }
    }

    return {
        inserted: rows.length,
        monthsAffected: Object.keys(monthlyExpenseMap).length,
    };
}

/* ---------- fetch ---------- */

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
    // Expect YYYY-MM-01
    if (!/^\d{4}-(0[1-9]|1[0-2])-01$/.test(month)) {
        throw new Error("Date must be in YYYY-MM-01 format");
    }


    const [year, mon] = month.split("-").map(Number);

    const start = `${year}-${String(mon).padStart(2, "0")}-01`;
    const endDate = new Date(year, mon, 1); // next month
    const end = endDate.toISOString().slice(0, 10);

    const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .gte("transaction_date", start)
        .lt("transaction_date", end)
        .order("transaction_date", { ascending: false });

    if (error) {
        console.error(error);
        throw new Error("Failed to fetch expenses for month");
    }

    return data;
}
