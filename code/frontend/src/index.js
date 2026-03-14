// src/index.js   (or src/main.jsx in some Vite setups)
import React from 'react';
import ReactDOM from 'react-dom/client';
import './Styles/index.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App';           // ← this line must match the export in App.js

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);