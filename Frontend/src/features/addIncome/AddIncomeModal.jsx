// src/features/addIncome/AddIncomeModal.jsx
import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  InputAdornment,
  Typography,
  IconButton,
  Grid,
} from "@mui/material";
import { Close, AttachMoney } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { addIncomeToMonth } from "../../services/apiService";

// --- CONSTANTS ---
const CURRENCIES = ["INR", "USD", "EUR"];

// --- STYLED COMPONENTS ---
const DarkTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
    "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#10B981" },
  },
  "& .MuiInputLabel-root": { color: "#9CA3AF" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiSvgIcon-root": { color: "#9CA3AF" },
  marginBottom: 20,
});

const AddIncomeModal = ({ open, onClose, onSave }) => {
  const today = new Date();

  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD",
    month: String(today.getMonth() + 1).padStart(2, "0"), // "01".."12"
    year: String(today.getFullYear()), // "2026"
  });

  const months = useMemo(
    () => [
      { value: "01", label: "January" },
      { value: "02", label: "February" },
      { value: "03", label: "March" },
      { value: "04", label: "April" },
      { value: "05", label: "May" },
      { value: "06", label: "June" },
      { value: "07", label: "July" },
      { value: "08", label: "August" },
      { value: "09", label: "September" },
      { value: "10", label: "October" },
      { value: "11", label: "November" },
      { value: "12", label: "December" },
    ],
    []
  );

  const years = useMemo(() => {
    const y = today.getFullYear();
    return [y - 2, y - 1, y, y + 1, y + 2].map(String);
  }, [today]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

 const handleSubmit = async () => {
    if (!formData.amount) return;

    // Construct the month string in YYYY-MM-01 format as required by the service
    const formattedMonth = `${formData.year}-${formData.month}-01`;

    const payload = {
      amount: parseFloat(formData.amount),
      // currency: formData.currency, // Include this if your API supports it
      month: formattedMonth, // Matches the isValidMonth(month) check
    };

    try {
      // If your onSave prop is used for UI updates, pass the payload
      if (onSave) onSave(payload);

      // Calling the service with the expected object
      // Note: Your service snippet showed 'insertIncome', 
      // but your code calls 'addIncomeToMonth'. Ensure they are aligned.
      const responseData = await addIncomeToMonth(payload);
      
      console.log("Income inserted successfully:", responseData);
      onClose();
    } catch (err) {
      console.error("Add income failed:", err.message);
      // Optional: Add a state to show this error to the user
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 6,
          backgroundColor: "#1e2330",
          backgroundImage: "none",
          maxWidth: "520px",
          width: "100%",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0px 20px 40px rgba(0,0,0,0.4)",
        },
      }}
    >
      {/* ✅ Fix: no nested headings */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography
          component="span" // ✅ prevents <h6> inside <h2>
          variant="h6"
          fontWeight="bold"
          sx={{ color: "white" }}
        >
          Add Income (Month)
        </Typography>

        <IconButton onClick={onClose} sx={{ color: "#9CA3AF" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* AMOUNT */}
          <Grid item xs={12}>
            <DarkTextField
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* CURRENCY */}
          <Grid item xs={12} md={6}>
            <DarkTextField
              select
              fullWidth
              label="Currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              {CURRENCIES.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </DarkTextField>
          </Grid>

          {/* MONTH */}
          <Grid item xs={12} md={6}>
            <DarkTextField
              select
              fullWidth
              label="Month"
              name="month"
              value={formData.month}
              onChange={handleChange}
            >
              {months.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </DarkTextField>
          </Grid>

          {/* YEAR */}
          <Grid item xs={12}>
            <DarkTextField
              select
              fullWidth
              label="Year"
              name="year"
              value={formData.year}
              onChange={handleChange}
            >
              {years.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </DarkTextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          sx={{ color: "#9CA3AF", borderRadius: 3, px: 3 }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.2,
            bgcolor: "#10B981",
            fontWeight: "bold",
            "&:hover": { bgcolor: "#059669" },
          }}
        >
          Save Income
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddIncomeModal;