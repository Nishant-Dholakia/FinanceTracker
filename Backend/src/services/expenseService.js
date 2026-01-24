import { supabase } from "../supabaseClient.js";
import { EXPENSE_CATEGORIES } from "../constants/enums.js";

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

export async function insertExpenses({ income, expenses }) {
    if (typeof income !== "number" || income <= 0) {
        throw new Error("Invalid income");
    }

    if (!Array.isArray(expenses) || expenses.length === 0) {
        throw new Error("Expenses must be a non-empty array");
    }

    // -------- TRANSFORM & VALIDATE EXPENSES --------
    const rows = expenses.map((exp) => {
        const { amount, description, category, transaction_date } = exp;

        if (
            typeof amount !== "number" ||
            amount <= 0 ||
            typeof description !== "string" ||
            description.trim() === "" ||
            typeof transaction_date !== "string"
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

    const { error } = await supabase
        .from("expenses")
        .insert(rows);

    if (error) {
        console.error("Supabase insert error:", error);
        throw new Error("Failed to insert expenses");
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
