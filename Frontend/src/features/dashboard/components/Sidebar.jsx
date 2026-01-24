// src/components/Sidebar.jsx
import React from 'react';
import { Paper, IconButton, Select, MenuItem, FormControl, Box } from '@mui/material';
import { Wallet, Dashboard as DashboardIcon } from '@mui/icons-material';
import { getCurrencySymbol } from '../utils/currencyUtils';
const Sidebar = ({ selectedYear, setSelectedYear, selectedMonth, setSelectedMonth, availableYears = [] }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <>
    {/* Style to hide scrollbar but keep functionality */}
    <style>
      {`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}
    </style>

    <div className="w-20 lg:w-24 hidden md:flex flex-col items-center py-8 border-r border-gray-800 sticky top-0 h-screen z-10 bg-[#0f1219]">
      
      {/* 1. LOGO */}
      <Paper elevation={0} className="mb-8 p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
        <Wallet />
      </Paper>
      
      {/* 2. YEAR SELECTOR */}
      <Box sx={{ width: '100%', px: 2, mb: 4 }}>
        <FormControl fullWidth variant="standard">
            <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                disableUnderline
                sx={{ 
                    color: '#F97316', 
                    fontWeight: 'bold', 
                    fontSize: '1.1rem',
                    textAlign: 'center',
                    '& .MuiSelect-select': { paddingRight: '0 !important', textAlign: 'center' },
                    '& .MuiSvgIcon-root': { display: 'none' } 
                }}
            >
                {availableYears.map((year) => (
                    <MenuItem key={year} value={year}>
                        {year}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
      </Box>

      {/* 3. MONTHS NAVIGATION (RESTORED) */}
      <nav className="flex flex-col gap-6 text-gray-500 font-medium text-sm w-full items-center overflow-y-auto no-scrollbar h-full">
        {months.map((m) => (
          <div 
            key={m} 
            onClick={() => setSelectedMonth(m)}
            className={`cursor-pointer transition w-full text-center py-1 border-l-2 
                ${selectedMonth === m 
                    ? 'text-white font-bold border-orange-500 bg-white/5' 
                    : 'border-transparent hover:text-white'
                }`}
          >
            {m}
          </div>
        ))}
        {/* Padding at bottom so last month isn't hidden behind the icon */}
        <div className="pb-20"></div> 
      </nav>
      
      {/* 4. FOOTER ICON */}
      <div className="mt-auto pt-4 border-t border-gray-800 w-full flex justify-center bg-[#0f1219]">
          <IconButton className="bg-white/10 text-white"><DashboardIcon /></IconButton>
      </div>

    </div>
    </>
  );
};

export default Sidebar;