import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Typography,
  CircularProgress,
} from "@mui/material";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { fetchMonthlyInsights } from "../../services/apiService";

/* -------------------- CONFIG -------------------- */

const BASE_CURRENCY = "INR";
const EXCHANGE_RATES = { INR: 1, USD: 0.012 };

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#0f1219", paper: "#1e2330" },
    primary: { main: "#F97316" },
    secondary: { main: "#8B5CF6" },
    success: { main: "#10B981" },
    text: { primary: "#ffffff", secondary: "#9CA3AF" },
  },
  typography: {
    fontFamily: '"Inter","Roboto","Helvetica","Arial",sans-serif',
    h3: { fontSize: "2rem", fontWeight: 700 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 24, backgroundImage: "none" },
      },
    },
  },
});

/* -------------------- HELPERS -------------------- */

const convertCurrency = (value, currency) =>
  Number.isFinite(value) && EXCHANGE_RATES[currency]
    ? value * EXCHANGE_RATES[currency]
    : 0;

const formatCurrency = (value, currency) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(convertCurrency(value, currency));

const formatPct = (value) => `${Number(value || 0).toFixed(2)}%`;

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-01`;
};

/* -------------------- COMPONENT -------------------- */

export default function MonthlyInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState(BASE_CURRENCY);
  const [categoryView] = useState("amount");

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    const fetchMonthlyPrediction = async () => {
      try {
        setLoading(true);

        const month = "2026-01-01";
        const prediction = await fetchMonthlyInsights(month); // ✅ already JSON

        setData(prediction);
        localStorage.setItem(
          "monthlyPrediction",
          JSON.stringify(prediction)
        );
      } catch (err) {
        console.error("❌ Monthly fetch failed:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyPrediction();
  }, []);

  /* ---------------- SAFE DERIVED DATA ---------------- */

  const safeData = data ?? {};
  const totalExpense = safeData.total_expense ?? 0;
  const income = safeData.income ?? 0;

  const categoryStats = useMemo(() => {
    const categories = safeData.category_wise_expenses ?? {};
    return Object.entries(categories)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense ? (amount / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [safeData.category_wise_expenses, totalExpense]);

  const topCategory = categoryStats[0];

  /* ---------------- LOADING / EMPTY ---------------- */

  if (loading) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box className="min-h-screen flex items-center justify-center">
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (!data) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box className="min-h-screen flex items-center justify-center">
          <Typography>No data available</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  /* -------------------- UI -------------------- */

return (
  <ThemeProvider theme={darkTheme}>
    <CssBaseline />
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f1219", p: 4, color: "#F8FAFC" }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", display: "flex", flexDirection: "column", gap: 4 }}>

        {/* HEADER */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h3" fontWeight={800}>
            Monthly Insights — {safeData.month}
          </Typography>

          <ButtonGroup size="small" variant="outlined">
            <Button onClick={() => setCurrency("INR")} color={currency === "INR" ? "primary" : "inherit"}>
              INR
            </Button>
            <Button onClick={() => setCurrency("USD")} color={currency === "USD" ? "primary" : "inherit"}>
              USD
            </Button>
          </ButtonGroup>
        </Box>

        {/* SUMMARY CARDS */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Income</Typography>
              <Typography variant="h4">{formatCurrency(income, currency)}</Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography color="text.secondary">Total Expense</Typography>
              <Typography variant="h4" color="error.main">
                {formatCurrency(totalExpense, currency)}
              </Typography>
              <Typography color="text.secondary" mt={1}>
                Expense Ratio: <strong>{safeData.expense_ratio?.toFixed(2)}%</strong>
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography color="text.secondary">Predicted Savings</Typography>
              <Typography variant="h4" color="success.main">
                {formatCurrency(safeData.predicted_savings ?? 0, currency)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(safeData.savings_rate ?? 0, 100)}
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                Savings Rate: {formatPct(safeData.savings_rate)}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* PREVIOUS MONTH COMPARISON */}
        {safeData.month_comparison && (
          <Card>
            <CardContent>
              <Typography variant="h6">Month Comparison</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography color="text.secondary">
                Previous Month: <strong>{safeData.month_comparison.previous_month}</strong>
              </Typography>
              <Typography color="text.secondary">
                Previous Savings:{" "}
                <strong>
                  {formatCurrency(
                    safeData.month_comparison.previous_savings,
                    currency
                  )}
                </strong>
              </Typography>
              <Typography
                color={safeData.month_comparison.change_rate < 0 ? "error.main" : "success.main"}
                fontWeight={700}
              >
                Change Rate: {formatPct(safeData.month_comparison.change_rate)}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* CATEGORY EXPENSES */}
        <Card>
          <CardContent>
            <Typography variant="h6">Category-wise Expenses</Typography>
            <Divider sx={{ my: 2 }} />

            {categoryStats.map(({ category, amount, percentage }) => (
              <Box key={category} mb={2}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography fontWeight={600}>{category}</Typography>
                  <Typography>
                    {formatCurrency(amount, currency)} ({formatPct(percentage)})
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(percentage, 100)}
                  sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* ALERTS */}
        {safeData.alerts?.length > 0 && (
          <Card sx={{ border: "1px solid rgba(248,113,113,0.6)" }}>
            <CardContent>
              <Typography variant="h6" color="error.main">
                Alerts
              </Typography>
              <Divider sx={{ my: 2 }} />
              {safeData.alerts.map((alert, idx) => (
                <Typography key={idx} sx={{ color: "#FCA5A5", mb: 1 }}>
                  {alert}
                </Typography>
              ))}
            </CardContent>
          </Card>
        )}

        {/* FUTURE ADVICE */}
        {safeData.future_advice?.length > 0 && (
          <Card sx={{ border: "1px solid rgba(250,204,21,0.6)" }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: "#FACC15" }}>
                Future Advice
              </Typography>
              <Divider sx={{ my: 2 }} />
              {safeData.future_advice.map((tip, idx) => (
                <Typography key={idx} sx={{ color: "#FDE68A", mb: 1 }}>
                  {tip}
                </Typography>
              ))}
            </CardContent>
          </Card>
        )}

      </Box>
    </Box>
  </ThemeProvider>
);

}
