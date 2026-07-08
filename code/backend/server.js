// ============================================================
// NagroMS — server.js  (Express entry point)
// ============================================================

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

// ── Initialise Firebase Admin (must happen before any route requires it) ──
require('./config/firebase');

// ── Routes ────────────────────────────────────────────────────────────────
const authRoutes    = require('./routes/authRoutes');
const farmerRoutes  = require('./routes/farmerRoutes');
const expertRoutes  = require('./routes/expertRoutes');
const networkRoutes = require('./routes/networkRoutes');
const weatherRoutes = require('./routes/weatherRoutes');

// ─────────────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security / logging middleware ─────────────────────────────────────────
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001',
];
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin "${origin}" not allowed`));
  },
  credentials: true,
}));

// ── Body parsers ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Global rate limiter ───────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/farmer',  farmerRoutes);
app.use('/api/expert',  expertRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/weather', weatherRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' })
);

// ── Global error handler ──────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  NagroMS backend running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Firebase    : ${process.env.FIREBASE_PROJECT_ID}`);
});
