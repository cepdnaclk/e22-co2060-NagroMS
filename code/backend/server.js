// ============================================================
// NagroMS Backend — server.js
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const farmerRoutes = require('./routes/farmerRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security middleware ──────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Rate limiting ────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Body parsing ─────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request logging (dev only) ───────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🌾 NagroMS API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/farmer', farmerRoutes);

// Add other routes when ready:
app.use('/api/expert',   require('./routes/expertRoutes'));
// app.use('/api/farmer',   require('./routes/farmerRoutes'));

// ── 404 handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start server with retry on EADDRINUSE ─────────────────────
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`\n🌾 NagroMS Backend running`);
    console.log(`📡 Port     : ${port}`);
    console.log(`🌍 Env      : ${process.env.NODE_ENV}`);
    console.log(`🔗 Health   : http://localhost:${port}/health\n`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.warn(`⚠️  Port ${port} in use — trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });
};

startServer(Number(PORT));

module.exports = app;