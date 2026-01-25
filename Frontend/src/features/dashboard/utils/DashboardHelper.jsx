// src/utils/dashboardHelper.js

import { Home, Checkroom, DirectionsCar, ShoppingCart, Restaurant, Category } from '@mui/icons-material';
import { getCurrencySymbol } from './currencyUtils';

// 1. MAP API CODES TO UI STYLES
export const CATEGORY_CONFIG = {
  FOOD: { label: 'Food & Dining', icon: <Restaurant />, color: 'bg-orange-500', colorHex: '#F97316' },
  TRANSPORT: { label: 'Transport', icon: <DirectionsCar />, color: 'bg-blue-500', colorHex: '#3B82F6' },
  SHOPPING: { label: 'Shopping', icon: <ShoppingCart />, color: 'bg-pink-500', colorHex: '#EC4899' },
  UTILITIES: { label: 'Bills & Utils', icon: <Home />, color: 'bg-purple-500', colorHex: '#8B5CF6' },
  OTHER: { label: 'Others', icon: <Category />, color: 'bg-gray-500', colorHex: '#6B7280' },
};
export const processDashboardData = (transactions, selectedYear, selectedMonthStr) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = months.indexOf(selectedMonthStr); // e.g. "Jan" -> 0
const detectedCurrency = transactions.length > 0 ? transactions[0].currency : 'IR';
// console.log(detectedCurrency)
  // --- A. FILTER DATA ---
  // 1. All transactions for the selected YEAR (for Charts)
  const yearlyTransactions = transactions.filter(t => {
    const d = new Date(t.transaction_date);
    return d.getFullYear() === parseInt(selectedYear);
  });

  // 2. Transactions for the selected MONTH (for Cards/Lists)
  const monthlyTransactions = yearlyTransactions.filter(t => {
    const d = new Date(t.transaction_date);
    return d.getMonth() === monthIndex;
  });

  // --- B. CALCULATE AGGREGATES ---
  
  // 1. Total Monthly Spending
  const monthlySpending = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

  // 2. Generate Chart History (Yearly view)
  // We map over all 12 months to create the graph points
  const history = months.map((m, idx) => {
    const monthTxns = yearlyTransactions.filter(t => new Date(t.transaction_date).getMonth() === idx);
    const expense = monthTxns.reduce((sum, t) => sum + t.amount, 0);
    
    // MOCK INCOME: Since API only gives expenses, we assume a fixed salary or random variation
    // In a real app, you'd fetch income data too.
    const income = 50000; 

    return { name: m, income, expense };
  });

  // 3. Group by Category (For the Donut Chart & List)
  const categoryMap = {};
  monthlyTransactions.forEach(t => {
    const code = t.category_code || 'OTHER';
    if (!categoryMap[code]) categoryMap[code] = 0;
    categoryMap[code] += t.amount;
  });

  const categories = Object.keys(categoryMap).map(code => {
    const config = CATEGORY_CONFIG[code] || CATEGORY_CONFIG.OTHER;
    return {
      name: config.label,
      amount: categoryMap[code],
      icon: config.icon,
      color: config.color, // Tailwind class
      hex: config.colorHex // Hex for charts
    };
  });

  // 4. Asset Allocation (Donut Chart) 
  // We use the categories calculated above for the pie chart
  const assets = categories.map(c => ({
    name: c.name,
    value: c.amount,
    color: c.hex
  }));
      const symbol = getCurrencySymbol(detectedCurrency);
  
  // --- C. RETURN FORMATTED DATA OBJECT ---
  return {
    currency: detectedCurrency,
    user: { name: "Simon K. Jimmy", role: "Mortgage Consultant", img: "https://i.pravatar.cc/150?img=11" },
    balance: 190000 - 10000, // Mock logic: Starting balance - spent
    netWorth: 278378,
    monthlyIncome: 50000, // Mock fixed income
    monthlySpending,
    incomeGoal: { current: 50000, target: 80000 },
    history,        // For Area/Line Charts
    incomeSources: [ // Keeping mock as API doesn't have income sources
      { name: 'Salary', value: 45000 },
      { name: 'Freelance', value: 5000 },
    ], 
    categories,     // For "Spendings" list
    assets,         // For Pie Chart
    notifications: [
      { id: 1, text: `You spent ${symbol}${monthlySpending} in ${selectedMonthStr}`, severity: "info" }
    ]
  };
};