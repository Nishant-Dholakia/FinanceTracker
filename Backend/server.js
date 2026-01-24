import express from "express";
import { fetchAllExpenses, getExpensesByMonth, insertExpenses } from "./src/services/expenseService.js";
import { getMonthlySummary, getMonthlySummaryByMonth } from "./src/services/monthlySummaryService.js";
import { insertIncome } from "./src/services/incomeService.js";
import cors from "cors";
import { analyzeRecommendations } from "./src/services/futureRecommendationService.js";

const port = 3000;
const app = express();
app.use(express.json());

app.use(
    cors({
        origin: "http://localhost:5174", // ✅ your frontend
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

app.listen(port, () => {
    console.log("Backend running on port 3000");
});
