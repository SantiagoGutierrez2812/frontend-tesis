import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // ahora usamos App.tsx

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);