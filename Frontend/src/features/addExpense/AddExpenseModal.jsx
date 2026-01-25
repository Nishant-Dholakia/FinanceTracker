import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Grid,
  InputAdornment,
  Typography,
  Box,
  IconButton,
  Divider
} from '@mui/material';
import { Close, CalendarToday, AttachMoney, Add, Delete } from '@mui/icons-material';
import { styled } from '@mui/material/styles';


const CURRENCIES = ['INR', 'USD', 'EUR'];
const EXCHANGE_RATE = 0.012; // 1 INR = 0.012 USD

const EXPENSE_CATEGORIES = {
  FOOD: "FOOD",
  TRANSPORT: "TRANSPORT",
  SHOPPING: "SHOPPING",
  UTILITIES: "UTILITIES",
  ENTERTAINMENT: "ENTERTAINMENT",
  OTHER: "OTHER",
};

// --- STYLED COMPONENTS ---
const DarkTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
    '&.Mui-focused fieldset': { borderColor: '#F97316' }, // Primary Orange
  },
  '& .MuiInputLabel-root': { color: '#9CA3AF' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#F97316' },
  '& .MuiInputBase-input': { color: '#fff' },
  '& .MuiSvgIcon-root': { color: '#9CA3AF' },
  marginBottom: 20
});

const AddExpenseModal = ({ open, onClose, onSave }) => {
  const navigate = useNavigate();

  const [currency, setCurrency] = useState('INR');
  const [month, setMonth] = useState(new Date().toISOString().split('T')[0].substring(0, 7) + '-01');
  const [income, setIncome] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenses, setExpenses] = useState([]);

  const getCurrencySymbol = () => {
    return currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€';
  };

  const convertAmount = (amount, fromCurrency, toCurrency) => {
    if (!amount || isNaN(amount)) return 0;
    const numAmount = parseFloat(amount);
    if (fromCurrency === toCurrency) return numAmount;
    if (fromCurrency === 'INR' && toCurrency === 'USD') {
      return numAmount * EXCHANGE_RATE;
    }
    if (fromCurrency === 'USD' && toCurrency === 'INR') {
      return numAmount / EXCHANGE_RATE;
    }
    return numAmount;
  };

  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value;
    const oldCurrency = currency;

    // Convert income
    if (income) {
      const convertedIncome = convertAmount(income, oldCurrency, newCurrency);
      setIncome(convertedIncome.toFixed(2));
    }

    // Convert all expense amounts
    setExpenses(prev => prev.map(exp => {
      if (exp.amount) {
        const converted = convertAmount(exp.amount, oldCurrency, newCurrency);
        return { ...exp, amount: converted.toFixed(2) };
      }
      return exp;
    }));

    // Convert current expense amount if exists
    if (expenseAmount) {
      const converted = convertAmount(expenseAmount, oldCurrency, newCurrency);
      setExpenseAmount(converted.toFixed(2));
    }

    setCurrency(newCurrency);
  };

  const handleAddExpense = () => {
    if (selectedCategory && expenseAmount && parseFloat(expenseAmount) > 0) {
      setExpenses(prev => [...prev, {
        id: Date.now(),
        category: selectedCategory,
        amount: parseFloat(expenseAmount)
      }]);
      setSelectedCategory('');
      setExpenseAmount('');
    }
  };

  const handleRemoveExpense = (id) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  const handleSubmit = async () => {
    const expensesObj = {};
    expenses.forEach(exp => {
      if (expensesObj[exp.category]) {
        expensesObj[exp.category] += exp.amount;
      } else {
        expensesObj[exp.category] = exp.amount;
      }
    });

    const payload = {
      month: month,
      income: parseFloat(income) || 0,
      expenses: expensesObj
    };

    try {
      // Convert income to base currency (INR) if needed
      let incomeValue = parseFloat(income) || 0;
      if (currency !== 'INR') {
        incomeValue = convertAmount(incomeValue, currency, 'INR');
      }

      // Convert expenses to base currency (INR) if needed
      const expensesInINR = {};
      Object.keys(expensesObj).forEach(key => {
        let expenseValue = expensesObj[key];
        if (currency !== 'INR') {
          expenseValue = convertAmount(expenseValue, currency, 'INR');
        }
        expensesInINR[key] = expenseValue;
      });

      const mlPayload = {
        month: month,
        income: incomeValue,
        expenses: expensesInINR
      };

      // const result = await predictMonthly(mlPayload);
      const response = await fetch("http://localhost:3000/predict/monthly", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(mlPayload)
});

if (!response.ok) {
  throw new Error("Server error");
}

const result = await response.json();

      
      console.log('✅ Prediction result received:', result);
      
      // Store result in localStorage so MonthlyInsights can fetch it
      localStorage.setItem('monthlyPrediction', JSON.stringify(result));
      localStorage.setItem('predictionMonth', month);
      
      console.log('💾 Data saved to localStorage');

      // Dispatch custom event to notify MonthlyInsights
      window.dispatchEvent(new CustomEvent('monthlyPredictionUpdated', { detail: result }));
      console.log('📢 Custom event dispatched: monthlyPredictionUpdated');
      // Navigate to Monthly Insights page
      navigate('/monthly-insights');


      if (onSave) {
        onSave(result);
      }
      
      onClose();
    } catch (error) {
      console.error('Error predicting monthly data:', error);
      alert('Failed to get prediction. Please try again.');
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => {
    return sum + (parseFloat(exp.amount) || 0);
  }, 0);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 6,
          backgroundColor: '#1e2330', // Card background color from dashboard
          backgroundImage: 'none',
          maxWidth: '600px',
          width: '100%',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0px 20px 40px rgba(0,0,0,0.4)'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
          Monthly Summary
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#9CA3AF' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, maxHeight: '70vh', overflowY: 'auto' }}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          
          {/* MONTH */}
          <Grid item xs={12}>
            <DarkTextField
              fullWidth
              type="date"
              label="Month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <InputAdornment position="start" sx={{ color: '#9CA3AF' }}><CalendarToday /></InputAdornment>,
              }}
            />
          </Grid>

          {/* INCOME & CURRENCY */}
          <Grid item xs={8}>
            <DarkTextField
              fullWidth
              label="Income"
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ color: '#ffffff' }}>
                    {getCurrencySymbol()}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <DarkTextField
              select
              fullWidth
              label="Currency"
              value={currency}
              onChange={handleCurrencyChange}
            >
              {CURRENCIES.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </DarkTextField>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 2 }} />
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Expenses by Category
            </Typography>
          </Grid>

          {/* ADD EXPENSE */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <DarkTextField
                select
                fullWidth
                label="Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                sx={{ marginBottom: 0 }}
              >
                {Object.values(EXPENSE_CATEGORIES).map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </DarkTextField>
              <DarkTextField
                fullWidth
                label="Amount"
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddExpense()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ color: '#ffffff' }}>
                      {getCurrencySymbol()}
                    </InputAdornment>
                  ),
                }}
                sx={{ marginBottom: 0 }}
              />
              <Button
                variant="contained"
                onClick={handleAddExpense}
                sx={{
                  bgcolor: '#F97316',
                  borderRadius: 3,
                  px: 3,
                  '&:hover': { bgcolor: '#ea580c' }
                }}
              >
                <Add /> ADD
              </Button>
            </Box>
          </Grid>

          {/* EXPENSES LIST */}
          {expenses.map((expense) => (
            <Grid item xs={12} key={expense.id}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{
                  flex: 1,
                  bgcolor: 'rgba(255,255,255,0.03)',
                  p: 2,
                  borderRadius: 3,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="body1" sx={{ color: 'white', fontWeight: 'medium' }}>
                    {expense.category}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#F97316', fontWeight: 'bold' }}>
                    {getCurrencySymbol()}{expense.amount.toFixed(2)}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => handleRemoveExpense(expense.id)}
                  sx={{
                    color: '#9CA3AF',
                    borderColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 3,
                    minWidth: '100px',
                    '&:hover': {
                      borderColor: '#F97316',
                      color: '#F97316'
                    }
                  }}
                >
                  <Delete sx={{ mr: 1 }} /> REMOVE
                </Button>
              </Box>
            </Grid>
          ))}

          {/* TOTAL EXPENSES */}
          <Grid item xs={12}>
            <Box sx={{
              bgcolor: 'rgba(255,255,255,0.03)',
              p: 2,
              borderRadius: 4,
              mt: 2
            }}>
              <Typography variant="body1" sx={{ color: '#9CA3AF' }}>
                Total Expenses:
              </Typography>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                {getCurrencySymbol()}{totalExpenses.toFixed(2)}
              </Typography>
            </Box>
          </Grid>

        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} sx={{ color: '#9CA3AF', borderRadius: 3, px: 3 }}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          sx={{ 
            borderRadius: 3, 
            px: 4, 
            py: 1.2,
            bgcolor: '#F97316', 
            fontWeight: 'bold',
            '&:hover': { bgcolor: '#ea580c' } 
          }}
        >
          Save Expense
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddExpenseModal;