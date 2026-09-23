const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config(); // fallback

const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

// Structured Logger & Tracing Middleware
const logger = require("./utils/logger");
const requestIdMiddleware = require("./middleware/requestId");
const { noSqlSanitizer } = require("./middleware/security");
const errorHandler = require("./middleware/errorHandler");

// Rate Limiters
const {
  generalLimiter,
  authLimiter,
  aiLimiter,
  reportLimiter,
  deviceLimiter,
  paymentLimiter
} = require("./middleware/rateLimiter");

// Route Imports
const alertRoutes = require("./routes/alertRoutes");
const authRoutes = require("./routes/authRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const healthRoutes = require("./routes/healthRoutes");
const onboardingRoutes = require("./routes/onboardingRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/aiRoutes");
const reportRoutes = require("./routes/reportRoutes");
const dermatologyRoutes = require("./routes/dermatologyRoutes");
const skinRoutes = require("./routes/skinRoutes");
const doctorAiRoutes = require("./routes/doctorAiRoutes");
const skinAnalyzeRoutes = require("./routes/skinAnalyzeRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const phcRoutes = require("./routes/phcRoutes");
const trackRoutes = require("./routes/trackRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const healthProbeRoutes = require("./routes/healthProbeRoutes");
const { seedPublicHealthData } = require("./services/phcSeedData");

const app = express();

// 1. Trace ID & Request Context Middleware
app.use(requestIdMiddleware);

// 2. Production Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://checkout.razorpay.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
        connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

// 3. CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://health-pulse-ai-gamma.vercel.app",
  "https://health-sepia-three.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
  "http://localhost:8081",
].filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // Dynamically allow all Vercel production and preview deployments
  if (/^https:\/\/([a-z0-9-]+)\.vercel\.app$/i.test(origin)) return true;
  // Allow local development on any port
  if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        logger.warn(`[CORS Blocked] Origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key", "x-request-id", "x-razorpay-signature", "stripe-signature"]
  })
);

// 4. Request Parsers & NoSQL Injection Sanitization
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(noSqlSanitizer);

// 5. Request Logging with Request-ID Tracing
app.use((req, res, next) => {
  logger.info(`Incoming Request: ${req.method} ${req.originalUrl}`, {
    requestId: req.id,
    ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress
  });
  next();
});

// 6. Probes & Liveness Endpoints (mounted before general rate limits)
app.use("/", healthProbeRoutes);

// 7. Multi-Tier Rate Limiting
app.use("/api/", generalLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/reports", reportLimiter);
app.use("/api/device", deviceLimiter);
app.use("/api/devices", deviceLimiter);
app.use("/api/ai", aiLimiter);
app.use("/api/payments", paymentLimiter);

// 8. API Routes
app.use("/api/alerts", alertRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/device", deviceRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", doctorAiRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dermatology", dermatologyRoutes);
app.use("/api/skin", skinRoutes);
app.use("/api/skin-analyze", skinAnalyzeRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/phc", phcRoutes);
app.use("/api/track", trackRoutes);
app.use("/api/payments", paymentRoutes);

// 9. Static Storage for Report Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 10. Root Landing Route
app.get("/", (req, res) => {
  res.send("🚀 HealthPulse AI Backend | Production Edition 2.0 | Status: Online & Hardened");
});

// 11. Centralized Error Handler (Must be registered after all routes)
app.use(errorHandler);

const connectDB = require("./config/db");

const PORT = Number(process.env.PORT) || 5001;
const MAX_PORT_ATTEMPTS = 3;

const startServer = (port) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, "0.0.0.0", () => {
      logger.info(`🔥 Server running on http://0.0.0.0:${port} [PID: ${process.pid}]`);
      if (port !== PORT) {
        logger.warn(
          `⚠️ Backend port ${PORT} was in use; local API is now available on port ${port}. ` +
          `Update VITE_API_URL to http://localhost:${port}/api if your frontend should use this server.`
        );
      }
      resolve(server);
    });

    server.on("error", (err) => {
      reject(err);
    });
  });
};

const runServer = async () => {
  const ports = Array.from({ length: MAX_PORT_ATTEMPTS }, (_, index) => PORT + index);

  for (const port of ports) {
    try {
      await startServer(port);
      return;
    } catch (err) {
      if (err.code === "EADDRINUSE") {
        logger.warn(`⚠️ Port ${port} is already in use. Trying port ${port + 1}...`);
        continue;
      }
      throw err;
    }
  }

  throw new Error(`Unable to bind to any port in [${ports.join(", ")}]. Please free one or set a different PORT.`);
};

// Start MongoDB and launch server
connectDB()
  .then(async () => {
    try {
      await seedPublicHealthData();
    } catch (e) {
      logger.warn('[Warning] Seed failed or was skipped:', { error: e.message });
    }
    return runServer();
  })
  .catch((err) => {
    logger.error("❌ Server startup aborted due to MongoDB connection failure:", { error: err.message });
    process.exit(1);
  });