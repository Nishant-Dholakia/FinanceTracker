import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Typography,
  CircularProgress
} from '@mui/material';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';

const sampleData = {
  month: '2026-01',
  income: 8000,
  total_expense: 18700,
  predicted_savings: 0,
  savings_rate: 0,
  expense_ratio: 233.75,
  month_comparison: {
    previous_month: '2025-12',
    previous_savings: 14813.19,
    change_rate: -100
  },
  category_wise_expenses: {
    food: 1000,
    clothes: 1000,
    bills: 1700,
    transport: 6000,
    entertainment: 5000,
    others: 4000
  },
  alerts: [
    '⚠️ Savings trend weaker than usual',
    '⚠️ High spending concentration in Transport',
    '⚠️ High spending concentration in Entertainment',
    '⚠️ Expense ratio higher than your usual pattern'
  ],
  future_advice: [
    "📌 'Transport' drives 32.1% of expenses — optimizing it has high impact",
    "📌 'Entertainment' drives 26.7% of expenses — optimizing it has high impact",
    '📌 Aim for a savings rate around 46.7% based on your strongest past months'
  ]
};

const BASE_CURRENCY = 'INR';
const EXCHANGE_RATES = {
  INR: 1,
  USD: 0.012
};

const convertCurrency = (value, currency) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  if (!EXCHANGE_RATES[currency]) return safeValue;
  return safeValue * EXCHANGE_RATES[currency];
};

const formatCurrency = (value, currency) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  const convertedValue = convertCurrency(safeValue, currency);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(convertedValue);
};

const formatPct = (value) => `${Number(value || 0).toFixed(2)}%`;

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#0f1219', paper: '#1e2330' },
    primary: { main: '#F97316' },
    secondary: { main: '#8B5CF6' },
    success: { main: '#10B981' },
    text: { primary: '#ffffff', secondary: '#9CA3AF' }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontSize: '2rem', fontWeight: 700 }
  },
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 24, backgroundImage: 'none' } } }
  }
});

const MonthlyInsights = () => {
  const [data, setData] = useState(sampleData);
  const [loading, setLoading] = useState(false);
  const [categoryView, setCategoryView] = useState('amount');
  const [currency, setCurrency] = useState(BASE_CURRENCY);

  // Function to load data from localStorage
  const loadPredictionData = () => {
    const storedPrediction = localStorage.getItem('monthlyPrediction');
    if (storedPrediction) {
      try {
        const predictionData = JSON.parse(storedPrediction);
        console.log('📊 Loaded prediction data:', predictionData);
        setData(predictionData);
        return true;
      } catch (error) {
        console.error('❌ Error parsing stored prediction:', error);
        return false;
      }
    } else {
      console.log('ℹ️ No prediction data found in localStorage, using sample data');
      return false;
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadPredictionData();
  }, []);

  // Listen for storage events and custom events to update when new prediction is saved
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'monthlyPrediction') {
        try {
          const predictionData = JSON.parse(e.newValue);
          console.log('📊 Storage event: New prediction data received', predictionData);
          setData(predictionData);
        } catch (error) {
          console.error('❌ Error parsing stored prediction:', error);
        }
      }
    };

    const handlePredictionUpdate = (e) => {
      console.log('📊 Custom event: New prediction data received', e.detail);
      setData(e.detail);
      // Also update localStorage to keep it in sync
      localStorage.setItem('monthlyPrediction', JSON.stringify(e.detail));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('monthlyPredictionUpdated', handlePredictionUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('monthlyPredictionUpdated', handlePredictionUpdate);
    };
  }, []);

  // Poll localStorage every 2 seconds to check for updates (fallback)
  useEffect(() => {
    const interval = setInterval(() => {
      const stored = localStorage.getItem('monthlyPrediction');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Only update if data is different
          if (JSON.stringify(parsed) !== JSON.stringify(data)) {
            console.log('🔄 Polling: Found updated prediction data');
            setData(parsed);
          }
        } catch (error) {
          // Silent fail for polling
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [data]);

  const totalExpense = data.total_expense || 0;
  const categoryStats = useMemo(() => {
    return Object.entries(data.category_wise_expenses).map(([category, amount]) => {
      const percentage = totalExpense ? (amount / totalExpense) * 100 : 0;
      return { category, amount, percentage };
    }).sort((a, b) => b.amount - a.amount);
  }, [data.category_wise_expenses, totalExpense]);

  const topCategory = categoryStats[0];

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box className="min-h-screen bg-[#0f1219] text-white">
        <Box className="flex min-h-screen bg-[#0f1219]">
          <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full">
            <Box className="max-w-6xl mx-auto space-y-6">
        <Box className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Box>
            <Box className="flex items-center gap-3 mb-2">
              <Typography variant="h5" color="text.secondary">
                Monthly Summary
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={loadPredictionData}
                sx={{
                  color: '#9CA3AF',
                  borderColor: 'rgba(255,255,255,0.2)',
                  '&:hover': {
                    borderColor: '#F97316',
                    color: '#F97316'
                  }
                }}
              >
                🔄 Refresh
              </Button>
            </Box>
            <Box className="flex flex-wrap items-center gap-3">
              <Typography variant="h3">
                {data.month}
              </Typography>
              <ButtonGroup size="small" variant="outlined">
                <Button
                  onClick={() => setCurrency('USD')}
                  color={currency === 'USD' ? 'primary' : 'inherit'}
                >
                  USD
                </Button>
                <Button
                  onClick={() => setCurrency('INR')}
                  color={currency === 'INR' ? 'primary' : 'inherit'}
                >
                  INR
                </Button>
              </ButtonGroup>
            </Box>
            <Typography color="text.secondary">
              Base currency: {BASE_CURRENCY} · USD rate: 1 INR = 0.012 USD
            </Typography>
            <Typography color="text.secondary">
              Balance insight driven by your model output
            </Typography>
            {localStorage.getItem('monthlyPrediction') ? (
              <Typography color="success.main" variant="caption">
                ✅ Using ML model prediction data
              </Typography>
            ) : (
              <Typography color="warning.main" variant="caption">
                ⚠️ Using sample data - Submit form to see predictions
              </Typography>
            )}
          </Box>
          <Card className="bg-[#1e2330] rounded-3xl">
            <CardContent className="min-w-[240px]">
              <Typography variant="h6" color="text.secondary">
                Expense Ratio
              </Typography>
              <Typography variant="h4" color="error.main">
                {formatPct(data.expense_ratio)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(data.expense_ratio, 100)}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
                color={data.expense_ratio > 100 ? 'error' : 'success'}
              />
            </CardContent>
          </Card>
        </Box>

        <Box className="grid grid-cols-12 gap-6">
          <Card className="col-span-12 md:col-span-4 bg-[#1e2330] rounded-3xl">
            <CardContent>
              <Typography color="text.secondary">Income</Typography>
              <Typography variant="h4">{formatCurrency(data.income, currency)}</Typography>
              <Typography color="text.secondary">Month: {data.month}</Typography>
            </CardContent>
          </Card>
          <Card className="col-span-12 md:col-span-4 bg-[#1e2330] rounded-3xl">
            <CardContent>
              <Typography color="text.secondary">Total Expenses</Typography>
              <Typography variant="h4" color="error.main">
                {formatCurrency(data.total_expense, currency)}
              </Typography>
              {topCategory && (
                <Typography color="text.secondary">
                  Top driver: {topCategory.category}
                </Typography>
              )}
            </CardContent>
          </Card>
          <Card className="col-span-12 md:col-span-4 bg-[#1e2330] rounded-3xl">
            <CardContent>
              <Typography color="text.secondary">Predicted Savings</Typography>
              <Typography variant="h4" color="success.main">
                {formatCurrency(data.predicted_savings, currency)}
              </Typography>
              <Typography color="text.secondary">
                Savings Rate: {formatPct(data.savings_rate)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(data.savings_rate, 100)}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
                color={data.savings_rate < 10 ? 'warning' : 'success'}
              />
            </CardContent>
          </Card>

          <Card className="col-span-12 md:col-span-6 bg-[#1e2330] rounded-3xl">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Insights
              </Typography>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
              <Box className="space-y-2">
                <Typography color="text.secondary">
                  Expense ratio is {formatPct(data.expense_ratio)} this month.
                </Typography>
                <Typography color="text.secondary">
                  Savings target based on history: {formatPct(46.7)}
                </Typography>
                {topCategory && (
                  <Typography color="text.secondary">
                    Focus area: {topCategory.category} ({formatPct(topCategory.percentage)})
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          <Card className="col-span-12 md:col-span-6 bg-[#1e2330] rounded-3xl">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Budget Pulse
              </Typography>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
              <Box className="space-y-3">
                <Box className="flex items-center justify-between">
                  <Typography color="text.secondary">Income Coverage</Typography>
                  <Typography>{formatPct(Math.min((data.income / Math.max(data.total_expense, 1)) * 100, 999))}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((data.income / Math.max(data.total_expense, 1)) * 100, 100)}
                  sx={{ height: 8, borderRadius: 4 }}
                  color={data.income >= data.total_expense ? 'success' : 'warning'}
                />
                <Box className="flex items-center justify-between">
                  <Typography color="text.secondary">Expense Load</Typography>
                  <Typography>{formatPct(Math.min(data.expense_ratio, 999))}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(data.expense_ratio, 100)}
                  sx={{ height: 8, borderRadius: 4 }}
                  color={data.expense_ratio > 100 ? 'error' : 'success'}
                />
              </Box>
            </CardContent>
          </Card>

          <Card className="col-span-12 lg:col-span-7 bg-[#1e2330] rounded-3xl">
            <CardContent>
              <Box className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <Typography variant="h6">Category Wise Expenses</Typography>
                <ButtonGroup size="small" variant="outlined">
                  <Button
                    onClick={() => setCategoryView('amount')}
                    color={categoryView === 'amount' ? 'primary' : 'inherit'}
                  >
                    Amount
                  </Button>
                  <Button
                    onClick={() => setCategoryView('percent')}
                    color={categoryView === 'percent' ? 'primary' : 'inherit'}
                  >
                    Percent
                  </Button>
                </ButtonGroup>
              </Box>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
              <Box className="space-y-4">
                {categoryStats.map(({ category, amount, percentage }) => (
                  <Box key={category} className="space-y-2">
                    <Box className="flex items-center justify-between">
                      <Typography color="text.secondary" className="capitalize">
                        {category}
                      </Typography>
                      <Typography>
                        {categoryView === 'amount'
                          ? formatCurrency(amount, currency)
                          : formatPct(percentage)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(percentage, 100)}
                      sx={{ height: 8, borderRadius: 4 }}
                      color={percentage > 30 ? 'warning' : 'primary'}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card className="col-span-12 lg:col-span-5 bg-[#1e2330] rounded-3xl">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Month Comparison
              </Typography>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
              <Box className="space-y-2">
                <Typography color="text.secondary">
                  Previous Month: {data.month_comparison.previous_month || 'N/A'}
                </Typography>
                <Typography>
                  Previous Savings: {formatCurrency(data.month_comparison.previous_savings, currency)}
                </Typography>
                <Typography color={data.month_comparison.change_rate < 0 ? 'error.main' : 'success.main'}>
                  Change Rate: {data.month_comparison.change_rate ?? 0}%
                </Typography>
                <Typography color="text.secondary">
                  Predicted Savings: {formatCurrency(data.predicted_savings, currency)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card className="col-span-12 lg:col-span-6 bg-[#1e2330] rounded-3xl">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alerts
              </Typography>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
              <Box className="space-y-3">
                {data.alerts.map((alert, index) => (
                  <Box key={index} className="flex items-start gap-3">
                    <Box className="mt-1 h-2 w-2 rounded-full bg-orange-400" />
                    <Typography>{alert}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card className="col-span-12 lg:col-span-6 bg-[#1e2330] rounded-3xl">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Future Advice
              </Typography>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
              <Box className="space-y-3">
                {data.future_advice.map((tip, index) => (
                  <Box key={index} className="flex items-start gap-2">
                    <Box className="mt-1 h-2 w-2 rounded-full bg-orange-400" />
                    <Typography>{tip}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
            </Box>
          </main>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MonthlyInsights;