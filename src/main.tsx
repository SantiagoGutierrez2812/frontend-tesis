import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './home/home'; // Asegúrate que el archivo y carpeta estén bien

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);

