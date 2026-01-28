import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './index.css'; // Don't forget to uncomment this if you want Tailwind to work!
import Dashboard from "./features/dashboard/Dashboard"
import MainLayout from './MainLayout.jsx';
import Check from './components/Check.jsx';
import MonthlyInsights from './features/insights/MonthlyInsights.jsx'
import MonthlyTransactions from './features/expenseHistory/MonthlyTransactions.jsx';
import CheckAnomalyPage from './features/anomaly/CheckAnomaly.jsx';


// ✅ FIX: Import from the CURRENT directory, not the old project

const router = createBrowserRouter([

   
   {
    element: <MainLayout/>,
    children: [
         {
        path: "/",
        element: <Navigate to="/dashboard" replace />,
      },
      { 
    path: "/dashboard", 
    element: <Dashboard/>
   },
    { 
    path: "/test", 
    element: <Check/>,
   },
     { 
    path: "/history", 
    element:<MonthlyTransactions/> ,
   },
     {
        path: "/monthly-insights",
        element: <MonthlyInsights />
      },
      {
        path: "/check-anomaly",
        element: <CheckAnomalyPage />
      }
    ]}
]);

createRoot(document.getElementById("root")).render(
  <StrictMode >
    <RouterProvider router={router} />
  </StrictMode>
);