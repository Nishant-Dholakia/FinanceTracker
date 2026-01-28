// src/components/Navbar.jsx
import React, { useState } from 'react';

import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  InputBase, 
  Badge, 
  Avatar, 
  Box, 
  useTheme,
  Button
} from '@mui/material';
import {
  Search,
  Notifications,
  Settings,
  Menu as MenuIcon,
  KeyboardArrowDown,
  Add,
  AccountBalanceWallet,
  WarningAmber
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';


// Import the new modal
import AddExpenseModal from '../features/addExpense/AddExpenseModal';
import AddIncomeModal from '../features/addIncome/AddIncomeModal';
// import CheckAnomalyModal from '../features/anomaly/CheckAnomaly';

// --- STYLED COMPONENTS FOR SEARCH (Kept same as before) ---
const SearchContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 24,
  backgroundColor: alpha(theme.palette.common.white, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: '300px',
  },
  transition: 'all 0.3s ease',
  border: '1px solid rgba(255,255,255,0.05)'
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
}));

const handleCheckAnomaly = (payload) => {
  console.log('Calling anomaly service...', payload);
  // TODO: call FastAPI anomaly endpoint here
};


const Navbar = ({ onMenuClick }) => {
  const theme = useTheme();
  const [isAnomalyModalOpen, setIsAnomalyModalOpen] = useState(false);
  const navigate = useNavigate();

  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false); // New state


  const handleSaveIncome = (data) => console.log("Saving Income:", data); // New handler
  // MOCK SERVICE HANDLER
  const handleSaveExpense = (expenseData) => {
    console.log("Making request to backend service...", expenseData);
    // TODO: Call your actual service method here:
    // addExpense(expenseData).then(...);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: '#0f1219',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ height: 80 }}>

          {/* MOBILE MENU TOGGLE */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2, display: { md: 'none' }, color: '#9CA3AF' }}
            onClick={onMenuClick}
          >
            <MenuIcon />
          </IconButton>

          {/* LOGO */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Box
              sx={{
                width: 35,
                height: 35,
                bgcolor: 'primary.main',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1.5
              }}
            >
              <Typography variant="h6" fontWeight="bold" color="white">F</Typography>
            </Box>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 700, color: 'white', letterSpacing: '-0.5px' }}
            >
              FinTrak
            </Typography>
          </Box>

          {/* SEARCH BAR */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <SearchContainer>
              <SearchIconWrapper>
                <Search />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search transactions, assets..."
                inputProps={{ 'aria-label': 'search' }}
              />
            </SearchContainer>
          </Box>

          {/* RIGHT SIDE ICONS */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', ml: 'auto' }}>

            {/* --- NEW ADD EXPENSE BUTTON --- */}
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setIsModalOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #F97316 0%, #ea580c 100%)',
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                mr: 2,
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              Add Expense
            </Button>
            <Button
  variant="outlined"
  onClick={() => navigate("/monthly-insights")}
  sx={{
    borderRadius: '20px',
    textTransform: 'none',
    fontWeight: 600,
    px: 3,
    color: '#F97316',
    borderColor: '#F97316',
    display: { xs: 'none', sm: 'flex' }
  }}
>
  Monthly Insights
</Button>

            <Button
                variant="contained"
                startIcon={<AccountBalanceWallet />}
                onClick={() => setIsIncomeModalOpen(true)}
                sx={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                    display: { xs: 'none', sm: 'flex' }
                }}
            >
              Add Income
            </Button>
            <Button
              variant="outlined"
              startIcon={<WarningAmber />}
              onClick={() => navigate('/check-anomaly')}
              sx={{
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                color: '#FACC15',
                borderColor: 'rgba(250, 204, 21, 0.5)',
                boxShadow: '0 4px 12px rgba(250, 204, 21, 0.15)',
                display: { xs: 'none', sm: 'flex' },
                '&:hover': {
                  borderColor: '#FACC15',
                  backgroundColor: 'rgba(250, 204, 21, 0.08)'
                }
              }}
            >
              Check Anomaly
            </Button>




            {/* Mobile simplified button */}
            <IconButton
              onClick={() => setIsModalOpen(true)}
              sx={{
                display: { xs: 'flex', sm: 'none' },
                bgcolor: '#F97316',
                color: 'white',
                borderRadius: '12px',
                mr: 1
              }}
            >
              <Add />
            </IconButton>


            <IconButton size="small" sx={{ color: '#9CA3AF', bgcolor: 'rgba(255,255,255,0.05)', p: 1, borderRadius: '12px' }}>
              <Settings fontSize="small" />
            </IconButton>

            <IconButton size="small" sx={{ color: '#9CA3AF', bgcolor: 'rgba(255,255,255,0.05)', p: 1, borderRadius: '12px' }}>
              <Badge variant="dot" color="error" overlap="circular">
                <Notifications fontSize="small" />
              </Badge>
            </IconButton>

            {/* USER PROFILE */}
            <Box
              sx={{
                ml: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                p: 0.5,
                pr: 1.5,
                borderRadius: '30px',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
              }}
            >
              <Avatar
                alt="Simon K."
                src="https://i.pravatar.cc/150?img=11"
                sx={{ width: 40, height: 40, border: '2px solid #374151' }}
              />
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography variant="subtitle2" sx={{ color: 'white', lineHeight: 1 }}>Simon Jimmy</Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Admin</Typography>
              </Box>
              <KeyboardArrowDown sx={{ color: '#9CA3AF', fontSize: 16 }} />
            </Box>

          </Box>
        </Toolbar>
      </AppBar>

      {/* --- RENDER MODAL --- */}
      <AddExpenseModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExpense}
      />
      <AddIncomeModal
        open={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        onSave={handleSaveIncome}
      />

    </>
  );
};

export default Navbar;