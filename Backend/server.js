import express from "express";
import { fetchAllExpenses, insertExpenses } from "./src/services/expenseService.js";

const port = 3000;
const app = express();
app.use(express.json());

app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

app.post("/expenses", async (req, res) => {
    try {
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

app.post("/analyze", async (_, res) => {
    try {
        const result = await analyzeData();
        res.json({ status: "success", result });
    } catch (err) {
        res.status(500).json({ status: "failure", error: err.message });
    }
});

app.listen(port, () => {
    console.log("Backend running on port 3000");
});
