import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  InputAdornment,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import { Close, CalendarToday, Description, Category, AttachMoney } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { addExpense } from '../../services/apiService';

// --- CONSTANTS ---
const EXPENSE_CATEGORIES = {
  FOOD: "FOOD",
  TRANSPORT: "TRANSPORT",
  SHOPPING: "SHOPPING",
  UTILITIES: "UTILITIES",
  ENTERTAINMENT: "ENTERTAINMENT",
  OTHER: "OTHER",
};

const CURRENCIES = ['INR', 'USD', 'EUR'];

// --- STYLED COMPONENTS ---
const DarkTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
    '&.Mui-focused fieldset': { borderColor: '#F97316' },
  },
  '& .MuiInputLabel-root': { color: '#9CA3AF' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#F97316' },
  '& .MuiInputBase-input': { color: '#fff' },
  '& .MuiSvgIcon-root': { color: '#9CA3AF' },
  marginBottom: 20
});

const AddExpenseModal = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    description: '',
    category: 'FOOD',
    is_discretionary: false,
    transaction_date: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.amount) return;

    const responseData = await addExpense([{
      ...formData,
      amount: parseFloat(formData.amount)
    }]);

    console.log(responseData);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 6,
          backgroundColor: '#1e2330',
          backgroundImage: 'none',
          maxWidth: '500px',
          width: '100%',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0px 20px 40px rgba(0,0,0,0.4)'
        }
      }}
    >
      <DialogTitle
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}
      >
        {/* ✅ component="span" prevents <h5> inside <h2> */}
        <Typography component="span" variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
          New Expense
        </Typography>

        <IconButton onClick={onClose} sx={{ color: '#9CA3AF' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2} sx={{ mt: 1 }}>

          <Grid item xs={8}>
            <DarkTextField
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              InputProps={{
                startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={4}>
            <DarkTextField
              select
              fullWidth
              label="Currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              {CURRENCIES.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </DarkTextField>
          </Grid>

          <Grid item xs={12}>
            <DarkTextField
              select
              fullWidth
              label="Category"
              name="category"          // ✅ FIX
              value={formData.category}
              onChange={handleChange}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Category /></InputAdornment>,
              }}
            >
              {Object.keys(EXPENSE_CATEGORIES).map((key) => (
                <MenuItem key={key} value={key}>
                  {EXPENSE_CATEGORIES[key].charAt(0) + EXPENSE_CATEGORIES[key].slice(1).toLowerCase()}
                </MenuItem>
              ))}
            </DarkTextField>
          </Grid>

          <Grid item xs={12}>
            <DarkTextField
              fullWidth
              type="date"
              label="Transaction Date"
              name="transaction_date"
              value={formData.transaction_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><CalendarToday /></InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <DarkTextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              InputProps={{
                startAdornment: <InputAdornment position="start" sx={{ mt: 1.5 }}><Description /></InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: 'rgba(255,255,255,0.03)',
              p: 2,
              borderRadius: 4
            }}>
              <Box>
                <Typography variant="body1" color="white" fontWeight="medium">
                  Discretionary Spending?
                </Typography>
                <Typography variant="caption" color="#9CA3AF">
                  Was this purchase optional?
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_discretionary}
                    onChange={handleChange}
                    name="is_discretionary"
                    color="warning"
                  />
                }
                label=""
              />
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