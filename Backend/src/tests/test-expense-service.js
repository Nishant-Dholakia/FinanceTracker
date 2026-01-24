import { insertExpenses } from "../services/expenseService.js";

async function test() {
    try {
        const inserted = await insertExpenses({
            expenses: [
                {
                    amount: 12000,
                    description: "shopify",
                    category: "SHOPPING",
                    transaction_date: "2026-01-05",
                },
                {
                    amount: 25000,
                    description: "Github ai",
                    category: "OTHER",
                    transaction_date: "2026-01-10",
                },
            ],
        });

        console.log("Inserted rows:", inserted);
    } catch (err) {
        console.error("Test failed:", err.message);
    }
}

await test();
