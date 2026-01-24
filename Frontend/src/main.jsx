import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css'; // Don't forget to uncomment this if you want Tailwind to work!
import Dashboard from "./features/dashboard/Dashboard"
import MainLayout from './MainLayout.jsx';
import Check from './components/Check.jsx';

// ✅ FIX: Import from the CURRENT directory, not the old project

const router = createBrowserRouter([

   
   {
    element: <MainLayout/>,
    children: [
      { 
    path: "/dashboard", 
    element: <Dashboard/>
   },
    { 
    path: "/test", 
    element: <Check/>,
   },
     
    ]}
]);

createRoot(document.getElementById("root")).render(
  <StrictMode >
    <RouterProvider router={router} />
  </StrictMode>
);