import { Paper, Typography, LinearProgress, Box, CircularProgress } from '@mui/material';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import React, { useState, useEffect } from 'react';
import { getCurrencySymbol } from '../utils/currencyUtils';
import { getMonthlySummaryByMonth } from '../../../services/apiService';

const StatsRow = ({ data, currency, selectedYear, selectedMonth }) => {
  const symbol = getCurrencySymbol(currency);
  
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const monthMap = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const formattedDate = `${selectedYear}-${monthMap[selectedMonth]}-01`;
        console.log(formattedDate)
        const result = await getMonthlySummaryByMonth(formattedDate);
        console.log("statsrow: "+ result)
        setSummary(result);
      } catch (error) {
        console.error("Failed to fetch stats summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedYear, selectedMonth]);

  // Helper to show loading or data
  const renderValue = (value) => loading ? <CircularProgress size={14} sx={{ color: 'inherit' }} /> : `${symbol}${value?.toLocaleString()}`;

  return (
    <>
      {/* 1. NET WORTH / SAVINGS CARD */}
      <Paper className="min-w-0 col-span-12 md:col-span-4 p-6 relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
        <div className="relative z-10">
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Monthly Savings
          </Typography>
          <Typography variant="h3" sx={{ color: "white", fontSize: "2.5rem", mt: 1 }}>
            {renderValue(summary?.savings || 0)}
          </Typography>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
      </Paper>

      {/* 2. SPENDINGS MINI CHART */}
      <Paper className="min-w-0 col-span-12 md:col-span-3 p-6 border border-gray-800">
        <Typography variant="h3" gutterBottom>Spendings</Typography>
        <Typography variant="h4" fontWeight="bold">
          {renderValue(summary?.total_expense || 0)}
        </Typography>

        <div className="mt-4 w-full min-w-0">
          <ResponsiveContainer width="100%" height={64}>
            <LineChart data={data.history}>
              <Line type="monotone" dataKey="expense" stroke="#F87171" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Paper>

      {/* 3. INCOME MINI CHART (NOW DYNAMIC) */}
      <Paper className="min-w-0 col-span-12 md:col-span-3 p-6 border border-gray-800">
        <Typography variant="h3" gutterBottom>Income</Typography>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#10B981' }}>
          {renderValue(summary?.total_income || 0)}
        </Typography>

        <div className="mt-4 w-full min-w-0">
          <ResponsiveContainer width="100%" height={64}>
            <LineChart data={data.history}>
              <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Paper>

      {/* 4. INCOME GOAL PROGRESS */}
      <Paper className="min-w-0 col-span-12 md:col-span-2 p-6 border border-gray-800 flex flex-col justify-center">
        <Typography variant="h4" color="secondary" fontWeight="bold">
          {summary?.total_income > 0 ? Math.round((summary.total_income / 100000) * 100) : 0}%
        </Typography>

        <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
          Goal Progress
        </Typography>

        <div className="text-xs text-right mt-2 text-gray-300">
          {symbol}{((summary?.total_income || 0) / 1000).toFixed(1)}k / {symbol}200k
        </div>

        <LinearProgress
          variant="determinate"
          value={Math.min(((summary?.total_income || 0) / 100000) * 100, 200)}
          color="secondary"
          sx={{ height: 8, borderRadius: 5, bgcolor: "#374151" }}
        />
      </Paper>
    </>
  );
};

export default StatsRow;