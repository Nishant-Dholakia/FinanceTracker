import express from "express";
//import { fetchAllExpenses, getExpensesByMonth, insertExpenses } from "./src/services/expenseService.js";
//import { getMonthlySummary, getMonthlySummaryByMonth } from "./src/services/monthlySummaryService.js";
//import { insertIncome } from "./src/services/incomeService.js";
import cors from "cors";
//import { analyzeRecommendations } from "./src/services/futureRecommendationService.js";
import fetch from "node-fetch";

const port = 3000;
const app = express();
app.use(express.json());

app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:5174"], // ✅ Allow both frontend ports
        credentials: true, // ✅ allow cookies/credentials
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

app.post("/expenses", async (req, res) => {
    // console.log("api called")
    try {
        // console.log(req.body)
        const inserted = await insertExpenses(req.body);
        res.status(201).json({
            status: "success",
            inserted,
        });
    } catch (err) {
        res.status(400).json({
            status: "failure",
            error: err.message,
        });
    }
});

app.get("/expenses", async (_, res) => {
    try {
        const expenses = await fetchAllExpenses();
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ status: "failure", error: err.message });
    }
});

app.get("/expenses/month/:month", async (req, res) => {
    try {
        const data = await getExpensesByMonth(req.params.month);
        res.json(data);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.post("/income", async (req, res) => {
    try {
        await insertIncome(req.body);
        res.status(201).json({ status: "success" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get("/monthly-summary", async (req, res) => {
    try {
        const { from, to } = req.query;

        const data = await getMonthlySummary({ from, to });

        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/monthly-summary/:month", async (req, res) => {
    try {
        const data = await getMonthlySummaryByMonth(req.params.month);
        res.json(data);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.get("/analyze/recommendations/:month", async (req, res) => {
    try {
        const result = await analyzeRecommendations(req.params.month);
        res.json(result);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// app.post("/predict/monthly", async (req, res) => {
//     try {
//         const { month, income, expenses } = req.body;
        
//         if (!month || !income || !expenses) {
//             return res.status(400).json({ error: "Missing required fields: month, income, expenses" });
//         }

//         // Format month to YYYY-MM if it's YYYY-MM-DD
//         const formattedMonth = month.includes('-01') ? month.slice(0, 7) : month;

//         // Call ML service
//         const response = await fetch("http://localhost:8000/predict", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 month: formattedMonth,
//                 income: parseFloat(income),
//                 expenses: expenses
//             }),
//         });

//         if (!response.ok) {
//             throw new Error("ML service failed");
//         }

//         const result = await response.json();
//         res.json(result);
//     } catch (e) {
//         res.status(400).json({ error: e.message });
//     }
// });

app.post("/predict/monthly", async (req, res) => {
    try {
        console.log("✅ Predict Monthly API hit");
        console.log("📦 Data from React:", req.body);

        const { month, income, expenses } = req.body;

        if (!month || income === undefined || !expenses) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const formattedMonth = month.slice(0, 7);

        console.log("📅 Month:", formattedMonth);
        console.log("💰 Income:", income);
        console.log("🛒 Expenses:", expenses);

        const response = await fetch("http://127.0.0.1:8000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                month: formattedMonth,
                income,
                expenses
            }),
        });

        const result = await response.json();

        console.log("🤖 ML Response:", result);

        res.json(result);
    } catch (err) {
        console.error("❌ Error:", err.message);
        res.status(400).json({ error: err.message });
    }
});


app.listen(port, () => {
    console.log("Backend running on port 3000");
});