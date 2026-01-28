import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper, Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, MenuItem, Select,
  FormControl, Chip, CircularProgress, IconButton, Tooltip
} from '@mui/material';
import {
  Restaurant, DirectionsCar, ShoppingCart,
  Home, Category, Movie, LocalHospital,
  FileDownload, ReceiptLong, AccountBalanceWallet, TrendingDown
} from '@mui/icons-material';

import { getExpenseByMonth } from '../../services/apiService';
import { getCurrencySymbol } from '../dashboard/utils/currencyUtils';

// --- ENHANCED CONFIGURATION ---
const CATEGORY_MAP = {
  FOOD: { label: 'Food', icon: <Restaurant />, color: '#F97316', gradient: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)' },
  TRANSPORT: { label: 'Transport', icon: <DirectionsCar />, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)' },
  SHOPPING: { label: 'Shopping', icon: <ShoppingCart />, color: '#EC4899', gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)' },
  UTILITIES: { label: 'Utilities', icon: <Home />, color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)' },
  ENTERTAINMENT: { label: 'Movies', icon: <Movie />, color: '#E11D48', gradient: 'linear-gradient(135deg, #E11D48 0%, #FB7185 100%)' },
  HEALTH: { label: 'Health', icon: <LocalHospital />, color: '#10B981', gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' },
  OTHER: { label: 'Misc', icon: <Category />, color: '#94A3B8', gradient: 'linear-gradient(135deg, #94A3B8 0%, #CBD5E1 100%)' },
};

const months = [
  { v: '01', l: 'January' }, { v: '02', l: 'February' }, { v: '03', l: 'March' },
  { v: '04', l: 'April' }, { v: '05', l: 'May' }, { v: '06', l: 'June' },
  { v: '07', l: 'July' }, { v: '08', l: 'August' }, { v: '09', l: 'September' },
  { v: '10', l: 'October' }, { v: '11', l: 'November' }, { v: '12', l: 'December' }
];

const StatCard = ({ title, value, icon, color }) => (
  <Paper sx={{
    p: 2.5, flex: 1, minWidth: '200px', bgcolor: 'rgba(30, 35, 48, 0.5)',
    borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', gap: 2,
    backdropFilter: 'blur(10px)'
  }}>
    <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${color}15`, color: color, display: 'flex' }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
        {title}
      </Typography>
      <Typography variant="h5" sx={{ color: 'white', fontWeight: 800 }}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

const MonthlyTransactions = () => {
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()].v);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const yearList = useMemo(() => {
    const years = [];
    for (let i = currentYear; i >= 2000; i--) years.push(i);
    return years;
  }, [currentYear]);

  const totalSpent = useMemo(
    () => transactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
    [transactions]
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dateParam = `${selectedYear}-${selectedMonth}-01`;
        const data = await getExpenseByMonth(dateParam);
        console.log(data)
        setTransactions(data || []);
      } catch (error) {
        console.error(error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth, selectedYear]);

  // ---------- CSV EXPORT ----------
  const escapeCsv = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };

  const downloadCSV = () => {
    if (loading || !transactions?.length) return;

    const headers = ['Date', 'Description', 'Category', 'Amount', 'Currency', 'Source', 'ID'];

    const rows = transactions.map((t) => [
      new Date(t.transaction_date).toISOString().slice(0, 10),
      t.description || 'General Transaction',
      (CATEGORY_MAP[t.category_code] || CATEGORY_MAP.OTHER).label,
      t.amount,
      t.currency,
      t.source,
      t.id,
    ]);

    const csv = [
      headers.map(escapeCsv).join(','),
      ...rows.map((r) => r.map(escapeCsv).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const fileName = `expenses_${selectedYear}-${selectedMonth}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };
  // -------------------------------

  const mainCategoryLabel = useMemo(() => {
    if (!transactions.length) return 'N/A';
    const freq = new Map();
    for (const t of transactions) {
      const key = t.category_code || 'OTHER';
      freq.set(key, (freq.get(key) || 0) + 1);
    }
    let bestKey = 'OTHER';
    let bestCount = 0;
    for (const [k, c] of freq.entries()) {
      if (c > bestCount) {
        bestKey = k;
        bestCount = c;
      }
    }
    return (CATEGORY_MAP[bestKey] || CATEGORY_MAP.OTHER).label;
  }, [transactions]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#0f1219', minHeight: '100vh', color: 'white' }}>

      {/* 1. TOP BAR */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: 2, display: 'flex' }}>
            <ReceiptLong sx={{ color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1 }}>Ledger</Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 500 }}>Transaction History & Insights</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small">
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              sx={{ bgcolor: '#1e2330', color: 'white', borderRadius: 2, '.MuiOutlinedInput-notchedOutline': { border: 'none' } }}
            >
              {months.map(m => <MenuItem key={m.v} value={m.v}>{m.l}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small">
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              sx={{ bgcolor: '#1e2330', color: 'white', borderRadius: 2, '.MuiOutlinedInput-notchedOutline': { border: 'none' } }}
            >
              {yearList.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </Select>
          </FormControl>

          <Tooltip title={transactions.length ? 'Export CSV' : 'No transactions to export'}>
            <span>
              <IconButton
                onClick={downloadCSV}
                disabled={loading || !transactions.length}
                sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'white' }}
              >
                <FileDownload />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* 2. STATS ROW */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <StatCard
          title="Total Outflow"
          value={`${getCurrencySymbol('INR')}${totalSpent.toLocaleString()}`}
          icon={<TrendingDown />}
          color="#F97316"
        />
        <StatCard
          title="Transactions"
          value={transactions.length}
          icon={<ReceiptLong />}
          color="#3B82F6"
        />
        <StatCard
          title="Main Category"
          value={mainCategoryLabel}
          icon={<AccountBalanceWallet />}
          color="#10B981"
        />
      </Box>

      {/* 3. TABLE AREA */}
      <Paper sx={{
        bgcolor: 'rgba(30, 35, 48, 0.4)', borderRadius: 6, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)'
      }}>
        <TableContainer
          sx={{
            maxHeight: '60vh',
            overflowY: 'auto',

            // Hide scrollbar (Chrome, Edge, Safari)
            '&::-webkit-scrollbar': { width: 0, height: 0 },
            '&::-webkit-scrollbar-thumb': { background: 'transparent' },

            // Hide scrollbar (Firefox)
            scrollbarWidth: 'none',

            // Hide scrollbar (IE/old Edge)
            msOverflowStyle: 'none',
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {['Date', 'Transaction Details', 'Category', 'Amount'].map((head) => (
                  <TableCell
                    key={head}
                    sx={{
                      bgcolor: '#1e2330',
                      color: '#9CA3AF',
                      fontWeight: 700,
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      py: 2.5
                    }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 10, border: 'none' }}>
                    <CircularProgress color="primary" />
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 10, border: 'none', color: '#9CA3AF' }}>
                    No transactions found for this month.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((row) => {
                  const cat = CATEGORY_MAP[row.category_code] || CATEGORY_MAP.OTHER;
                  return (
                    <TableRow
                      key={row.id}
                      sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' }, transition: '0.2s' }}
                    >
                      <TableCell sx={{ color: '#9CA3AF', borderColor: 'rgba(255,255,255,0.05)', fontWeight: 500 }}>
                        {new Date(row.transaction_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>

                      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          {row.description || 'General Transaction'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          ID: {row.id?.substring?.(0, 8)}... • {row.source}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <Chip
                          label={cat.label}
                          size="small"
                          sx={{
                            background: cat.gradient,
                            color: 'white',
                            fontWeight: 700,
                            px: 1,
                            boxShadow: `0 4px 12px ${cat.color}30`,
                            border: 'none'
                          }}
                        />
                      </TableCell>

                      <TableCell
                        sx={{ color: 'white', fontWeight: 900, fontSize: '1.1rem', borderColor: 'rgba(255,255,255,0.05)' }}
                        align="right"
                      >
                        {getCurrencySymbol(row.currency)} {Number(row.amount || 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default MonthlyTransactions;