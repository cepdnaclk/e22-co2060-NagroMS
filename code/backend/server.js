const express = require("express");
const cors    = require("cors");
const app     = express();

// ── Middleware ────────────────────────────────────────
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────
app.use("/api/expert", require("./routes/expertRoutes"));

// Add other team members' routes here when ready:
// app.use("/api/auth",     require("./routes/authRoutes"));
// app.use("/api/farmer",   require("./routes/farmerRoutes"));
// app.use("/api/customer", require("./routes/customerRoutes"));
// app.use("/api/admin",    require("./routes/adminRoutes"));

// ── Health check ──────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "NagroMS API running ✅" }));

// ── Start ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));