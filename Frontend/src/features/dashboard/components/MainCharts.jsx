import React from 'react';
import { Paper, Typography, Avatar, IconButton } from '@mui/material';
import { MoreHoriz } from '@mui/icons-material';
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, 
  AreaChart, Area, CartesianGrid, YAxis, PieChart, Pie 
} from 'recharts';
import { getCurrencySymbol } from '../utils/currencyUtils';

const MainCharts = ({ data ,currency}) => {
    const symbol = getCurrencySymbol(currency);
  return (
    <>
      {/* 5. INCOME SOURCES (BAR CHART) */}
      <Paper className="col-span-12 md:col-span-5 p-6 border border-gray-800">
        <Typography variant="h3" gutterBottom>Income Source</Typography>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.incomeSources}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#111827', border: 'none', borderRadius: '8px'}} />
              <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30}>
                {data.incomeSources.map((entry, index) => (
                  <Cell key={`cell-{symbol}{index}`} fill={index === 3 ? '#10B981' : '#374151'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Paper>

      {/* 6. SPENDINGS BREAKDOWN */}
      <Paper className="col-span-12 md:col-span-3 p-6 border border-gray-800">
        <Typography variant="h3" gutterBottom>Spendings</Typography>
        <div className="flex flex-col gap-5 mt-4">
          {data.categories.map((cat, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 {/* ... Icon ... */}
                <Typography variant="body2" fontWeight="medium">{cat.name}</Typography>
              </div>
              <Typography variant="body2" fontWeight="bold">
                {symbol}{cat.amount.toLocaleString()} {/* Dynamic Symbol */}
              </Typography>
            </div>
          ))}
        </div>
      </Paper>

      {/* 7. NOTIFICATIONS */}
      <Paper className="col-span-12 md:col-span-4 p-6 border border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h3">Notification</Typography>
          <IconButton size="small"><MoreHoriz fontSize="small" /></IconButton>
        </div>
        {data.notifications.map((notif) => (
          <div key={notif.id} className="bg-gray-800/50 p-3 rounded-lg border-l-4 border-orange-500 mb-3">
            <Typography variant="body2" color="textSecondary">{notif.text}</Typography>
          </div>
        ))}
      </Paper>

      {/* 8. MAIN AREA CHART */}
      <Paper className="col-span-12 md:col-span-8 p-6 border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h3">Income & Expenses</Typography>
          <div className="flex gap-4">
              <div className="text-right">
                  <Typography variant="caption" color="textSecondary">Max. Expenses</Typography>
                  <Typography variant="subtitle2" sx={{ color: '#F97316' }}>{symbol}20,239</Typography>
              </div>
              <div className="text-right">
                  <Typography variant="caption" color="textSecondary">Max. Income</Typography>
                  <Typography variant="subtitle2" sx={{ color: '#10B981' }}>{symbol}20,239</Typography>
              </div>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.history}>
              <defs>
                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} />
              <Tooltip contentStyle={{backgroundColor: '#111827', borderColor: '#374151', color: '#fff'}} />
              <Area type="monotone" dataKey="income" stroke="#10B981" fillOpacity={1} fill="url(#colorInc)" strokeWidth={3} />
              <Area type="monotone" dataKey="expense" stroke="#F97316" fillOpacity={1} fill="url(#colorExp)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Paper>



      {/* 9. ASSETS DONUT CHART */}
      <Paper className="col-span-12 md:col-span-4 p-6 border border-gray-800">
        <Typography variant="h3" gutterBottom>Assets</Typography>
        <div className="flex items-center">
          <div className="h-40 w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data.assets} 
                  cx="50%" cy="50%" 
                  innerRadius={40} outerRadius={60} 
                  paddingAngle={5} dataKey="value"
                >
                  {data.assets.map((entry, index) => (
                    <Cell key={`cell-{symbol}{index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 flex flex-col gap-2">
            {data.assets.map((asset) => (
              <div key={asset.name} className="flex justify-between items-center">
                  <Typography variant="body2" color="textSecondary">{asset.name}</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {symbol}{asset.value.toLocaleString()} {/* Dynamic Symbol */}
                  </Typography>
              </div>
            ))}
          </div>
        </div>
      </Paper>
    </>
  );
};

export default MainCharts;