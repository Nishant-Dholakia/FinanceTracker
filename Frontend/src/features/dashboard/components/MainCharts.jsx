import React, { useState, useEffect, useMemo } from 'react';
import { Paper, Typography, IconButton, CircularProgress, Box } from '@mui/material';
import { MoreHoriz } from '@mui/icons-material';
import { 
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { getCurrencySymbol } from '../utils/currencyUtils';
import { getMonthlySummaryByMonth, getExpenseByMonth } from '../../../services/apiService';

const MainCharts = ({ data, currency, selectedYear, selectedMonth }) => {
  const symbol = getCurrencySymbol(currency);
  
  // --- STATE ---
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [rawExpenses, setRawExpenses] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  // Helper to map Sidebar month string to API format
  const monthMap = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
  };

  // --- FETCH DATA ON CHANGE ---
  useEffect(() => {
    const fetchData = async () => {
      const formattedDate = `${selectedYear}-${monthMap[selectedMonth]}-01`;
      
      // 1. Fetch Summary Data (Pie Chart & Anomaly Logic)
      setLoadingSummary(true);
      try {
        const summary = await getMonthlySummaryByMonth(formattedDate);
        setMonthlySummary(summary);
      } catch (err) {
        console.error("Summary Fetch Error:", err);
        setMonthlySummary(null);
      } finally {
        setLoadingSummary(false);
      }

      // 2. Fetch Detailed Expenses (Spendings List)
      setLoadingExpenses(true);
      try {
        const expenses = await getExpenseByMonth(formattedDate);
        setRawExpenses(expenses || []);
      } catch (err) {
        console.error("Expenses Fetch Error:", err);
        setRawExpenses([]);
      } finally {
        setLoadingExpenses(false);
      }
    };

    if (selectedYear && selectedMonth) {
      fetchData();
    }
  }, [selectedYear, selectedMonth]);

  // --- CALCULATE SPENDINGS BY CATEGORY ---
  const categorySpendings = useMemo(() => {
    const totals = {};
    rawExpenses.forEach(exp => {
      const cat = exp.category_code || 'OTHER';
      totals[cat] = (totals[cat] || 0) + exp.amount;
    });

    return Object.entries(totals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [rawExpenses]);

  const pieData = monthlySummary ? [
    { name: 'Expenses', value: monthlySummary.total_expense, color: '#F97316' }, 
    { name: 'Savings', value: monthlySummary.savings, color: '#10B981' },       
  ] : [];

  return (
    <>
      {/* 5. INCOME UTILIZATION (PIE CHART) */}
      <Paper className="min-w-0 col-span-12 md:col-span-5 p-6 border border-gray-800">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <Box>
                <Typography variant="h3">Income Utilization</Typography>
                <Typography variant="caption" color="textSecondary">
                    For {selectedMonth} {selectedYear}
                </Typography>
            </Box>
            {!loadingSummary && monthlySummary && (
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="textSecondary">Total Income</Typography>
                    <Typography variant="h6" color="primary" sx={{ lineHeight: 1 }}>
                        {symbol}{monthlySummary.total_income.toLocaleString()}
                    </Typography>
                </Box>
            )}
        </Box>

        <div className="h-48 w-full flex items-center justify-center">
          {loadingSummary ? (
            <CircularProgress size={24} />
          ) : monthlySummary ? (
            <ResponsiveContainer width="100%" height={192}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111827", border: "none", borderRadius: "8px" }} 
                  formatter={(value) => `${symbol}${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Typography variant="body2" color="textSecondary">No summary data</Typography>
          )}
        </div>
        
        {!loadingSummary && monthlySummary && (
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="textSecondary">
                    Savings Rate: <span style={{ color: '#10B981', fontWeight: 'bold' }}>{monthlySummary.savings_rate.toFixed(1)}%</span>
                </Typography>
                <Typography variant="caption" color="textSecondary">
                    Anomalies: <span style={{ color: monthlySummary.anomaly_count > 0 ? '#EF4444' : '#9CA3AF' }}>{monthlySummary.anomaly_count}</span>
                </Typography>
              </Box>
              <Box sx={{ width: '100%', height: 6, bgcolor: '#374151', borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ width: `${Math.min(monthlySummary.savings_rate, 100)}%`, height: '100%', bgcolor: '#10B981', borderRadius: 3 }} />
              </Box>
          </Box>
        )}
      </Paper>

      {/* 6. SPENDINGS BREAKDOWN (DYNAMIC LIST) */}
      <Paper className="min-w-0 col-span-12 md:col-span-3 p-6 border border-gray-800">
        <Typography variant="h3" gutterBottom>Spendings</Typography>
        <div className="flex flex-col gap-5 mt-4 min-w-0">
          {loadingExpenses ? (
            <CircularProgress size={20} sx={{ display: 'block', m: '20px auto' }} />
          ) : categorySpendings.length > 0 ? (
            categorySpendings.map((cat, i) => (
              <div key={i} className="flex items-center justify-between min-w-0">
                <Typography variant="body2" fontWeight="medium" className="capitalize truncate">
                  {cat.name.toLowerCase().replace('_', ' ')}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {symbol}{cat.amount.toLocaleString()}
                </Typography>
              </div>
            ))
          ) : (
            <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center', display: 'block', mt: 2 }}>
                No expenses found
            </Typography>
          )}
        </div>
      </Paper>

      {/* 7. NOTIFICATIONS & ALERTS */}
      <Paper className="min-w-0 col-span-12 md:col-span-4 p-6 border border-gray-800">
        <div className="flex justify-between items-center mb-4 min-w-0">
          <Typography variant="h3">Notification</Typography>
          <IconButton size="small"><MoreHoriz fontSize="small" /></IconButton>
        </div>
        {!loadingSummary && monthlySummary?.anomaly_count > 0 && (
          <div className="bg-red-500/10 p-3 rounded-lg border-l-4 border-red-500 mb-3">
            <Typography variant="body2" color="error" fontWeight="medium">
              Anomaly Alert: {monthlySummary.anomaly_count} unusual expenses detected.
            </Typography>
          </div>
        )}
        <div className="bg-gray-800/50 p-3 rounded-lg border-l-4 border-orange-500">
          <Typography variant="body2" color="textSecondary">
            Spendings are currently <strong>{monthlySummary?.expense_ratio.toFixed(0)}%</strong> of your income.
          </Typography>
        </div>
      </Paper>

      {/* 8. MAIN AREA CHART (HISTORY) */}
      <Paper className="min-w-0 col-span-12 md:col-span-8 p-6 border border-gray-800">
        <Typography variant="h3" sx={{ mb: 4 }}>Financial Trend</Typography>
        <div className="h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height={256}>
            <AreaChart data={data.history}>
              <defs>
                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF" }} />
              <Tooltip contentStyle={{ backgroundColor: "#111827", border: "none", borderRadius: "8px" }} />
              <Area type="monotone" dataKey="income" stroke="#10B981" fillOpacity={1} fill="url(#colorInc)" strokeWidth={3} />
              <Area type="monotone" dataKey="expense" stroke="#F97316" fillOpacity={1} fill="url(#colorExp)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Paper>

      {/* 9. ASSETS DONUT CHART */}
      <Paper className="min-w-0 col-span-12 md:col-span-4 p-6 border border-gray-800">
        <Typography variant="h3" gutterBottom>Assets</Typography>
        <div className="flex items-center min-w-0">
          <div className="h-40 w-1/2 min-w-0">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={data.assets} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                  {data.assets.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 flex flex-col gap-2 min-w-0">
            {data.assets.map((asset, i) => (
              <div key={i} className="flex justify-between items-center min-w-0">
                <Typography variant="body2" color="textSecondary" className="truncate">{asset.name}</Typography>
                <Typography variant="body2" fontWeight="bold">{symbol}{asset.value.toLocaleString()}</Typography>
              </div>
            ))}
          </div>
        </div>
      </Paper>
    </>
  );
};

export default MainCharts;