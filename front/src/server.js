const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

// Routes
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const authenticate = require("./middleware/auth");

dotenv.config();
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", authenticate, studentRoutes);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`✅ API running at http://localhost:${PORT}`)
);
