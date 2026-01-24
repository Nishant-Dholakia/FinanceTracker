export function computeFinanceMetrics(income, expenses) {
    const totalExpense = expenses.reduce(
        (sum, e) => sum + Number(e.amount),
        0
    );

    const savings = income - totalExpense;

    const savingsRate =
        income > 0 ? +(savings / income * 100).toFixed(2) : 0;

    const expenseRatio =
        income > 0 ? +(totalExpense / income * 100).toFixed(2) : 0;

    return {
        totalIncome: income,
        totalExpense,
        savings,
        savingsRate,
        expenseRatio,
    };
}

export function computeCategoryBreakdown(expenses) {
    const map = {};

    for (const e of expenses) {
        map[e.category_code] =
            (map[e.category_code] || 0) + Number(e.amount);
    }

    return Object.entries(map).map(([category, amount]) => ({
        category,
        amount,
    }));
}
