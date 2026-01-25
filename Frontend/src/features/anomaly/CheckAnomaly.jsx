import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import { WarningAmber, ErrorOutline } from '@mui/icons-material';

/* ---------- Helpers ---------- */

const Row = ({ label, value }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      py: 1
    }}
  >
    <Typography
      sx={{
        fontSize: 13,
        color: '#CBD5E1',        // ↑ brighter label
        fontWeight: 500
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: 14,
        color: '#F8FAFC',        // already good
        fontWeight: 600
      }}
    >
      {value}
    </Typography>
  </Box>
);

/* ---------- Page ---------- */

const CheckAnomalyPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          'http://localhost:3000/anomalies/month',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ month: '2026-01-01' })
          }
        );

        if (!res.ok) throw new Error('Failed to fetch anomalies');

        setData(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 6, textAlign: 'center', bgcolor: '#020617', minHeight: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2, color: '#E5E7EB' }}>
          Analysing expenses…
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 6, bgcolor: '#020617', minHeight: '100vh' }}>
        <Typography sx={{ color: '#FCA5A5' }}>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: '#020617', minHeight: '100vh' }}>
      <Paper
        sx={{
          p: 4,
          maxWidth: 900,
          mx: 'auto',
          bgcolor: '#0B1220',          // ↑ darker surface contrast
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.12)', // ↑ clearer border
          color: '#F8FAFC'
        }}
      >
        {/* HEADER */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmber sx={{ color: '#FDE047' }} />  {/* ↑ brighter */}
          <Typography variant="h6" fontWeight={700}>
            Expense Anomalies — January 2026
          </Typography>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.16)' }} />

        {/* SUMMARY */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ color: '#E5E7EB' }}>
            Anomalies Detected:{' '}
            <strong style={{ color: '#FDE047' }}>
              {data.anomaly_count}
            </strong>
          </Typography>
        </Box>

        {/* LIST */}
        {data.anomalies.map((item) => (
          <Paper
            key={item.id}
            sx={{
              p: 3,
              mb: 3,
              bgcolor: '#020617',
              borderRadius: '16px',
              border: item.error
                ? '1px solid rgba(248,113,113,0.7)'   // ↑ clearer red
                : '1px solid rgba(253,224,71,0.7)'    // ↑ clearer yellow
            }}
          >
            {/* TOP BAR */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}
            >
              <Typography fontWeight={700} fontSize={15} color="#F8FAFC">
                {item.category_code.toUpperCase()}
              </Typography>

              <Chip
                label={item.suspicious ? 'SUSPICIOUS' : 'NORMAL'}
                size="small"
                sx={{
                  bgcolor: item.suspicious ? '#FDE047' : '#4ADE80',
                  color: '#020617',
                  fontWeight: 800
                }}
              />
            </Box>

            {/* DETAILS */}
            <Row label="Date" value={item.transaction_date} />
            <Row
              label="Discretionary"
              value={item.is_discretionary ? 'Yes' : 'No'}
            />

            {/* ERROR / REASON */}
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: '12px',
                bgcolor: item.error
                  ? 'rgba(248,113,113,0.18)'
                  : 'rgba(253,224,71,0.18)',
                border: item.error
                  ? '1px solid rgba(248,113,113,0.6)'
                  : '1px solid rgba(253,224,71,0.6)'
              }}
            >
              <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                {item.error ? (
                  <ErrorOutline sx={{ color: '#FCA5A5' }} />
                ) : (
                  <WarningAmber sx={{ color: '#FDE047' }} />
                )}
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: item.error ? '#FCA5A5' : '#FDE047'
                  }}
                >
                  {item.error ? 'ERROR' : 'REASON'}
                </Typography>
              </Box>

              <Typography sx={{ fontSize: 14, color: '#F8FAFC' }}>
                {item.error || item.reason || '—'}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Paper>
    </Box>
  );
};

export default CheckAnomalyPage;
