import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// routes
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";
import userRoutes from "./routes/users.js";
import reportRoutes from "./routes/reports.js";
import dispatchRoutes from "./routes/dispatch.js";

dotenv.config();

const app = express();

//  CORS — REQUIRED for httpOnly cookie auth (Plan: JWT in cookies)
app.use(
  cors({
    origin: "http://localhost:5173", // frontend (Vite)
    credentials: true, // 🔥 MUST be true for cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type"]
  })
);

//  Core middlewares
app.use(express.json());
app.use(cookieParser()); // 🔥 REQUIRED for reading JWT cookie

//  Health check
app.get("/", (req, res) => {
  res.send("Backend running...");
});

// ================= ROUTES =================

// Auth (login, logout, me)
app.use("/api/auth", authRoutes);

// Protected modules (these should internally use requireAuth middleware)
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dispatch", dispatchRoutes);

// ================= ERROR HANDLING =================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});