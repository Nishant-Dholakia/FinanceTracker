import React from 'react';
import { Typography, Button, Chip, Avatar, Box } from '@mui/material';
import { Dashboard as DashboardIcon, Description, CalendarToday } from '@mui/icons-material';
import { getCurrencySymbol } from '../utils/currencyUtils';
const DashboardHeader = ({ user, balance,currency }) => {
     const symbol = getCurrencySymbol(currency);
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
     <div>
        <Typography variant="body2" color="textSecondary">Personal Finance Tracker</Typography>
        <Typography variant="h1" className="mt-1">Available Balance</Typography>
        <Typography variant="h3" sx={{ color: '#10B981', fontSize: '2.25rem', mt: 1 }}>
          {symbol}{balance.toLocaleString()} {/* Dynamic Symbol */}
        </Typography>
      </div> 

      <div className="flex gap-3 flex-wrap">
        <Button variant="outlined" startIcon={<DashboardIcon />} sx={{ borderColor: '#374151', color: 'white', borderRadius: 3 }}>
          Dashboard
        </Button>
        <Button variant="outlined" startIcon={<Description />} sx={{ borderColor: '#374151', color: 'white', borderRadius: 3 }}>
          Spreadsheet
        </Button>
        <Chip 
          icon={<CalendarToday style={{ fontSize: 16 }} />} 
          label="Sunday, Feb 5, 2023" 
          variant="outlined" 
          sx={{ borderColor: '#374151', borderRadius: 3, height: 36, color: 'white' }}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden lg:block">
          <Typography variant="subtitle1" fontWeight="bold">{user.name}</Typography>
          <Typography variant="caption" color="textSecondary">{user.role}</Typography>
        </div>
        <Avatar src={user.img} sx={{ width: 48, height: 48, border: '2px solid #374151' }} />
      </div>
    </header>
  );
};

export default DashboardHeader;