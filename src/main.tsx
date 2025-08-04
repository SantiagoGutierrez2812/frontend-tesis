import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import Home from './home/home'; 
import Dashboard  from  './pages/Dashboard'
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <Home /> */}
    <Dashboard />
  </React.StrictMode>
);

