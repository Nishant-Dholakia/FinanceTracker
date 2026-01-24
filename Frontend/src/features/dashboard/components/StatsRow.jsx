import { Paper, Typography, LinearProgress } from '@mui/material';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import React from 'react';
import { getCurrencySymbol } from '../utils/currencyUtils';

const StatsRow = ({ data,currency }) => {
       const symbol = getCurrencySymbol(currency);
  return (
    <>
      {/* 1. NET WORTH CARD */}
      <Paper className="col-span-12 md:col-span-4 p-6 relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
        <div className="relative z-10">
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Total Net Worth</Typography>
          <Typography variant="h3" sx={{ color: 'white', fontSize: '2.5rem', mt: 1 }}>
            {symbol}{data.netWorth.toLocaleString()}
          </Typography>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
      </Paper>

      {/* 2. SPENDINGS MINI CHART */}
      <Paper className="col-span-12 md:col-span-3 p-6 border border-gray-800">
        <Typography variant="h3" gutterBottom>Spendings</Typography>
        <Typography variant="h4" fontWeight="bold">{symbol}{data.monthlySpending.toLocaleString()}</Typography>
        <div className="h-16 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.history}>
              <Line type="monotone" dataKey="expense" stroke="#F87171" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Paper>

      {/* 3. INCOME MINI CHART */}
      <Paper className="col-span-12 md:col-span-3 p-6 border border-gray-800">
        <Typography variant="h3" gutterBottom>Income</Typography>
        <Typography variant="h4" fontWeight="bold">{symbol}{data.monthlyIncome.toLocaleString()}</Typography>
        <div className="h-16 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.history}>
              <Line type="monotone" dataKey="income" stroke="#F97316" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Paper>

      {/* 4. INCOME GOAL */}
      <Paper className="col-span-12 md:col-span-2 p-6 border border-gray-800 flex flex-col justify-center">
        <Typography variant="h4" color="secondary" fontWeight="bold">61%</Typography>
        <Typography variant="caption" color="textSecondary" display="block" gutterBottom>Income Goal</Typography>
        <div className="text-xs text-right mt-2 text-gray-300">
          {symbol}{(data.incomeGoal.current / 1000).toFixed(1)}k / {(data.incomeGoal.target / 1000).toFixed(0)}k
        </div>
        <LinearProgress 
          variant="determinate" 
          value={61} 
          color="secondary" 
          sx={{ height: 8, borderRadius: 5, bgcolor: '#374151' }} 
        />
      </Paper>
    </>
  );
};

export default StatsRow;