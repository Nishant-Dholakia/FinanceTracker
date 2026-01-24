export async function detectAnomalies(expenses) {
    // placeholder – replace with HTTP call later
    return expenses
        .filter(e => e.amount > 2000)
        .map(e => ({
            description: e.description,
            amount: e.amount,
            category: e.category_code,
        }));
}

export async function forecastSavings() {
    return {
        savings_6_months: 42000,
        savings_12_months: 68000,
    };
}
