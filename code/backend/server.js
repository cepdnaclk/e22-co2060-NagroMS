// ============================================================
// NagroMS Backend — server.js
// Main Express application entry point
// ============================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const farmerRoutes = require("./routes/farmerRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ── OpenAI Client ────────────────────────────────────────────
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ── Security middleware ──────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────
// Supports localhost:3000 and localhost:3001
const allowedOrigins = (
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  "http://localhost:3000,http://localhost:3001"
)
  .split(",")
  .map((url) => url.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      // allow Postman / server-to-server requests with no origin
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ── Body parsing ─────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request logging (dev only) ───────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Rate limiting: auth endpoints ────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Rate limiting: chatbot endpoint ──────────────────────────
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many chat requests. Please wait a moment and try again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Health check ─────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🌾 NagroMS API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── OpenAI Chatbot Route ─────────────────────────────────────
app.post("/api/chat", chatLimiter, async (req, res) => {
  try {
    const { message, messages } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "OPENAI_API_KEY is missing in backend .env file.",
      });
    }

    let userInput = "";

    // Supports simple frontend: { message: "hello" }
    if (typeof message === "string" && message.trim() !== "") {
      userInput = message.trim();
    }

    // Supports advanced frontend: { messages: [{ role: "user", content: "..." }] }
    if (!userInput && Array.isArray(messages) && messages.length > 0) {
      userInput = messages
        .slice(-6)
        .map((msg) => `${msg.role || "user"}: ${msg.content || msg.text || ""}`)
        .join("\n");
    }

    if (!userInput) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      instructions: `
You are NagroMS Farm Assistant, a helpful chatbot for Sri Lankan farmers.

Your style:
- Use simple English.
- Give short, practical answers.
- If the farmer's location is important, ask for district or area.
- Focus on farming, crops, planting seasons, fertilizers, pests, equipment, inventory, orders, weather, and farm loans.
- For Sri Lankan farming seasons, explain Yala and Maha clearly.
- Do not give dangerous chemical/pesticide dosage as final advice. Tell the farmer to confirm with an agriculture officer.
- If the question is not farming-related, politely guide the user back to farm management.
      `,
      input: userInput,
    });

    return res.status(200).json({
      success: true,
      reply: response.output_text || "Sorry, I could not generate a reply.",
    });
  } catch (error) {
    console.error("❌ OpenAI API Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get AI response.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// ── Existing Routes ──────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/farmer", farmerRoutes);

// ── 404 handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ── Start server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌾 NagroMS Backend running`);
  console.log(`📡 Port     : ${PORT}`);
  console.log(`🌍 Env      : ${process.env.NODE_ENV}`);
  console.log(`🔗 Health   : http://localhost:${PORT}/health`);
  console.log(`🤖 Chat API : http://localhost:${PORT}/api/chat\n`);
});

module.exports = app;