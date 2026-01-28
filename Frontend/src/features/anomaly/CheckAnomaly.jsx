import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Divider,
    Chip
} from '@mui/material';
import { WarningAmber, ErrorOutline } from '@mui/icons-material';
import { fetchAnomalyApi } from '../../services/apiService';

/* ---------- Helpers ---------- */

const Row = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
        <Typography sx={{ fontSize: 13, color: '#CBD5E1', fontWeight: 500 }}>
            {label}
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#F8FAFC', fontWeight: 600 }}>
            {value}
        </Typography>
    </Box>
);

/* ---------- Page ---------- */

const CheckAnomalyPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🔒 HARD LOCK — prevents multiple API calls
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchData = async () => {
            try {
                console.log("calling backend for anomaly");

                // axios already returns parsed JSON
                const data = await fetchAnomalyApi("2026-01-01");

                setData(data);
            } catch (err) {
                console.error("Anomaly fetch failed:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    /* ---------- STATES ---------- */

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
                <Typography sx={{ color: '#FCA5A5' }}>
                    {error}
                </Typography>
            </Box>
        );
    }

    /* ---------- UI ---------- */

    return (
        <Box sx={{ p: 4, bgcolor: '#020617', minHeight: '100vh' }}>
            <Paper
                sx={{
                    p: 4,
                    maxWidth: 900,
                    mx: 'auto',
                    bgcolor: '#0F172A',                 // ↑ clearer surface
                    borderRadius: '20px',
                    border: '1px solid rgba(148,163,184,0.25)', // slate border
                    color: '#F8FAFC'
                }}
            >
                {/* HEADER */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <WarningAmber sx={{ color: '#FACC15' }} /> {/* amber-400 */}
                    <Typography variant="h6" fontWeight={800} color="#F8FAFC">
                        Expense Anomalies — January 2026
                    </Typography>
                </Box>

                <Divider sx={{ my: 3, borderColor: 'rgba(148,163,184,0.25)' }} />

                {/* SUMMARY */}
                <Typography sx={{ mb: 3, color: '#E5E7EB', fontWeight: 500 }}>
                    Anomalies Detected:{' '}
                    <Box component="span" sx={{ color: '#FACC15', fontWeight: 800 }}>
                        {data.anomaly_count}
                    </Box>
                </Typography>

                {/* LIST */}
                {data.anomalies.map(item => (
                    <Paper
                        key={item.id}
                        sx={{
                            p: 3,
                            mb: 3,
                            bgcolor: '#020617',
                            borderRadius: '16px',
                            border: item.error
                                ? '1px solid rgba(248,113,113,0.8)'   // red-400
                                : '1px solid rgba(250,204,21,0.8)'    // amber-400
                        }}
                    >
                        {/* TOP BAR */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography fontWeight={800} color="#F8FAFC">
                                {(typeof item.category_code === 'string'
                                    ? item.category_code
                                    : 'UNKNOWN'
                                ).toUpperCase()}
                            </Typography>

                            <Chip
                                label={item.suspicious ? 'SUSPICIOUS' : 'NORMAL'}
                                size="small"
                                sx={{
                                    bgcolor: item.suspicious ? '#FACC15' : '#4ADE80',
                                    color: '#020617',
                                    fontWeight: 900
                                }}
                            />
                        </Box>

                        <Row label="Date" value={item.transaction_date} />
                        <Row label="Discretionary" value={item.is_discretionary ? 'Yes' : 'No'} />

                        {/* MESSAGE */}
                        <Box
                            sx={{
                                mt: 2,
                                p: 2,
                                borderRadius: '12px',
                                bgcolor: item.error
                                    ? 'rgba(248,113,113,0.15)'
                                    : 'rgba(250,204,21,0.15)',
                                border: item.error
                                    ? '1px solid rgba(248,113,113,0.6)'
                                    : '1px solid rgba(250,204,21,0.6)'
                            }}
                        >
                            <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                                {item.error ? (
                                    <ErrorOutline sx={{ color: '#FCA5A5' }} />
                                ) : (
                                    <WarningAmber sx={{ color: '#FACC15' }} />
                                )}
                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        fontWeight: 800,
                                        color: item.error ? '#FCA5A5' : '#FACC15'
                                    }}
                                >
                                    {item.error ? 'ERROR' : 'REASON'}
                                </Typography>
                            </Box>

                            <Typography sx={{ fontSize: 14, color: '#F8FAFC', lineHeight: 1.6 }}>
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
