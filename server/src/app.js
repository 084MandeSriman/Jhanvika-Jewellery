import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import productRoutes from "./routes/productRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import miscRoutes from "./routes/miscRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import recentlyViewedRoutes from "./routes/recentlyViewedRoutes.js";
import serviceRequestRoutes from "./routes/serviceRequestRoutes.js";
import returnRoutes from "./routes/returnRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { razorpayWebhook } from "./controllers/paymentController.js";
import { getSitemap, getRobotsTxt } from "./controllers/seoController.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Razorpay webhook MUST be registered before express.json() — signature
// verification needs the exact raw request bytes, which express.json()
// would otherwise consume and re-serialize (breaking the HMAC check).
app.post(
  "/api/payments/razorpay/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    req.rawBody = req.body;
    try {
      req.body = JSON.parse(req.body.toString("utf-8"));
    } catch {
      return res.status(400).json({ success: false, message: "Invalid webhook payload" });
    }
    next();
  },
  razorpayWebhook
);

app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));

// Basic rate limiting to protect against abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));
app.get("/sitemap.xml", getSitemap);
app.get("/robots.txt", getRobotsTxt);

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api", productRoutes);
app.use("/api", contentRoutes);
app.use("/api", authRoutes);
app.use("/api", wishlistRoutes);
app.use("/api", cartRoutes);
app.use("/api", addressRoutes);
app.use("/api", orderRoutes);
app.use("/api", couponRoutes);
app.use("/api", adminRoutes);
app.use("/api", otpRoutes);
app.use("/api", miscRoutes);
app.use("/api", paymentRoutes);
app.use("/api", reviewRoutes);
app.use("/api", searchRoutes);
app.use("/api", recentlyViewedRoutes);
app.use("/api", serviceRequestRoutes);
app.use("/api", returnRoutes);
app.use("/api", notificationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
