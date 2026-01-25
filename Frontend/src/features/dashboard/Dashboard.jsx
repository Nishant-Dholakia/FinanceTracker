import React, { useEffect, useMemo, useState } from 'react';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { Home, Checkroom, DirectionsCar } from '@mui/icons-material';

// Import our new components
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import StatsRow from './components/StatsRow';
import MainCharts from './components/MainCharts';
// Helper
import { processDashboardData } from './utils/DashboardHelper.jsx';

// Service (Assuming you have this)
import { getAllExpenses } from '../../services/apiService'

// --- THEME ---
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
    h1: { fontSize: '2rem', fontWeight: 700 },
    h3: { fontSize: '1rem', fontWeight: 600, color: '#9CA3AF' }
  },
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 24, backgroundImage: 'none' } } }
  }
});

const Dashboard = () => {
  // 1. STATE
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
 const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); 
  const [selectedMonth, setSelectedMonth] = useState('Jan');

  // --- LOGIC TO GET ALL YEARS FROM MIN TO MAX ---
  const availableYears = useMemo(() => {
    if (expenses.length === 0) return [new Date().getFullYear()];

    // 1. Extract valid years from all transactions
    const years = expenses
        .map(e => new Date(e.transaction_date).getFullYear())
        .filter(y => !isNaN(y)); // Safety check for invalid dates

    if (years.length === 0) return [new Date().getFullYear()];

    // 2. Find the range
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    // 3. Generate EVERY year between min and max (inclusive)
    const yearRange = [];
    for (let i = maxYear; i >= minYear; i--) {
      yearRange.push(i);
    }
    
    return yearRange;
  }, [expenses]);

  // If the currently selected year is not in the new range (e.g., after loading data), 
  // auto-select the most recent year (maxYear)
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(parseInt(selectedYear))) {
        setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);


  useEffect(() => {
    const fetchExpenses = async () => {
        try {
            // If you don't have the real service running yet, 
            // you can comment this out and use `setExpenses(MOCK_DATA)`
            const expenseData = await getAllExpenses();
            setExpenses(expenseData);
        } catch (err) {
            console.error("Failed to fetch expenses:", err);
        } finally {
            setLoading(false);
        }
    };
    fetchExpenses();
  }, []);

  // 3. PROCESS DATA (Runs whenever state changes)
  // This converts raw API data into the shape our UI needs
  const dashboardData = processDashboardData(expenses, selectedYear, selectedMonth);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="flex min-h-screen bg-[#0f1219]">
        
        {/* SIDEBAR */}
        <Sidebar 
            selectedYear={selectedYear} 
            setSelectedYear={setSelectedYear}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            availableYears={availableYears} // <--- Pass this new prop
        />

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full">
          
          {loading ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress color="primary" />
             </Box>
          ) : (
             <>
               {/* 1. Pass currency to Header */}
            {/* <DashboardHeader 
                user={dashboardData.user} 
                balance={dashboardData.balance} 
                currency={dashboardData.currency} 
            /> */}

              <div className="grid grid-cols-12 gap-6">
                {/* 2. Pass currency to StatsRow (Make sure StatsRow uses the getCurrencySymbol util internally or accepts this prop) */}
                <StatsRow 
                    data={dashboardData} 
                    currency={dashboardData.currency} 
                    selectedYear={selectedYear}
                        selectedMonth={selectedMonth}
                />
                
                {/* 3. Pass currency to MainCharts */}
                <MainCharts 
                    data={dashboardData} 
                    currency={dashboardData.currency} 
                    selectedYear={selectedYear}
                        selectedMonth={selectedMonth}
                />
            </div>
             </>
          )}

        </main>
      </div>
    </ThemeProvider>
  );
};

export default Dashboard;