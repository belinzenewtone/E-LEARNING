import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import lessonsRoutes from "./routes/lessons";
import weeksRoutes from "./routes/weeks";
import assignmentsRoutes from "./routes/assignments";
import progressRoutes from "./routes/progress";
import notesRoutes from "./routes/notes";
import studyLogsRoutes from "./routes/study-logs";
import notificationsRoutes from "./routes/notifications";
import analyticsRoutes from "./routes/analytics";
import searchRoutes from "./routes/search";
import settingsRoutes from "./routes/settings";
import exportRoutes from "./routes/export";
import { errorHandler } from "./middleware/error";

const app = express();
const PORT = process.env.PORT ?? 3001;

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000").split(",");

app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/weeks", weeksRoutes);
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/study-logs", studyLogsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/export", exportRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

export default app;
