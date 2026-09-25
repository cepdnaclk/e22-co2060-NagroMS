// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './Styles/index.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// ── PWA: Register Service Worker ──────────────────────────────
// This makes NagroMS installable as a phone app (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('[NagroMS PWA] Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.error('[NagroMS PWA] Service Worker registration failed:', error);
      });
  });
}
