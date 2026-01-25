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

  /* ---------------- UI ---------------- */

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box className="min-h-screen bg-[#0f1219] text-white p-6">
        <Box className="max-w-6xl mx-auto space-y-6">

          {/* HEADER */}
          <Box className="flex flex-wrap items-center justify-between gap-4">
            <Typography variant="h3">{safeData.month}</Typography>

            <ButtonGroup size="small" variant="outlined">
              <Button
                onClick={() => setCurrency("USD")}
                color={currency === "USD" ? "primary" : "inherit"}
              >
                USD
              </Button>
              <Button
                onClick={() => setCurrency("INR")}
                color={currency === "INR" ? "primary" : "inherit"}
              >
                INR
              </Button>
            </ButtonGroup>
          </Box>

          {/* SUMMARY */}
          <Box className="grid grid-cols-12 gap-6">
            <Card className="col-span-12 md:col-span-4">
              <CardContent>
                <Typography color="text.secondary">Income</Typography>
                <Typography variant="h4">
                  {formatCurrency(income, currency)}
                </Typography>
              </CardContent>
            </Card>

            <Card className="col-span-12 md:col-span-4">
              <CardContent>
                <Typography color="text.secondary">Total Expense</Typography>
                <Typography variant="h4" color="error.main">
                  {formatCurrency(totalExpense, currency)}
                </Typography>
                {topCategory && (
                  <Typography color="text.secondary">
                    Top driver: {topCategory.category}
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-12 md:col-span-4">
              <CardContent>
                <Typography color="text.secondary">
                  Predicted Savings
                </Typography>
                <Typography variant="h4" color="success.main">
                  {formatCurrency(
                    safeData.predicted_savings ?? 0,
                    currency
                  )}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(safeData.savings_rate ?? 0, 100)}
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Box>

          {/* CATEGORY LIST */}
          <Card>
            <CardContent>
              <Typography variant="h6">Category Wise Expenses</Typography>
              <Divider sx={{ my: 2 }} />

              {categoryStats.map(({ category, amount, percentage }) => (
                <Box key={category} mb={2}>
                  <Box className="flex justify-between">
                    <Typography className="capitalize">
                      {category}
                    </Typography>
                    <Typography>
                      {categoryView === "amount"
                        ? formatCurrency(amount, currency)
                        : formatPct(percentage)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(percentage, 100)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>

        </Box>
      </Box>
    </ThemeProvider>
  );
}
