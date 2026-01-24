// src/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Box } from '@mui/material';

const MainLayout =() => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      {/* Navbar at the top */}
      <Navbar />
      
      {/* Content area below */}
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <Outlet />
      </Box>
    </Box>
    
  );
}

export default MainLayout;