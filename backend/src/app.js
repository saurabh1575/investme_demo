import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { allowedOrigins, env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import adminRoutes from "./routes/admin.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import authRoutes from "./routes/auth.routes.js";
import bookingRoutes from "./routes/bookings.routes.js";
import communityRoutes from "./routes/communities.routes.js";
import investorRoutes from "./routes/investors.routes.js";
import mentorRoutes from "./routes/mentors.routes.js";
import messageRoutes from "./routes/messages.routes.js";
import paymentRoutes from "./routes/payments.routes.js";
import settingsRoutes from "./routes/settings.routes.js";

export const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..", "..");

app.use(helmet());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cors({
  origin(origin, callback) {
    if (!origin && allowedOrigins.includes("null")) return callback(null, true);
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "InvestMe API", timestamp: new Date().toISOString() });
});

app.use("/api/settings", settingsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/investors", investorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/admin", adminRoutes);

app.use(express.static(frontendRoot));

app.use(notFound);
app.use(errorHandler);
