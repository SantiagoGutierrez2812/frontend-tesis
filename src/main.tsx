import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './home/home';
// import Dashboard from './pages/Dashboard'

import Sidebar from './Registration_and_materials/Sidebar'
// import Dashboard  from  './pages/Dashboard'
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <Dashboard/> */}
    {/* <Sidebar/> */}
    <Home />
  </React.StrictMode>
);

