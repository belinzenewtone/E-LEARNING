import "dotenv/config";
import express, { Router } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

// Patch Router.prototype so async route handlers forward rejections to next()
// instead of crashing the process. Must run before any routes are imported.
(["get", "post", "put", "patch", "delete"] as const).forEach((method) => {
  const orig = (Router.prototype as Record<string, unknown>)[method] as (...a: unknown[]) => unknown;
  (Router.prototype as Record<string, unknown>)[method] = function (...args: unknown[]) {
    const wrapped = args.map((h) =>
      typeof h === "function"
        ? (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const result = (h as Function)(req, res, next);
            if (result && typeof (result as Promise<unknown>).catch === "function") {
              (result as Promise<unknown>).catch(next);
            }
          }
        : h
    );
    return orig.apply(this, wrapped);
  };
});

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
import { requestLogger, logger } from "./lib/logger";
import { db, pool } from "./lib/db";

const app = express();
const PORT = process.env.PORT ?? 3001;

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000").split(",");

app.use(helmet());
app.use(requestLogger);
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

// Health check — verifies DB connectivity via Prisma (same path as all other routes)
app.get("/api/health", async (_req, res) => {
  try {
    await db.user.count();
    res.json({ status: "ok", db: "ok", timestamp: new Date().toISOString() });
  } catch (err) {
    logger.error("health check failed", { message: (err as Error).message });
    res.status(503).json({ status: "error", db: "unreachable", timestamp: new Date().toISOString() });
  }
});

app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info("API server started", { port: PORT, env: process.env.NODE_ENV ?? "development" });
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
async function shutdown(signal: string) {
  logger.info("shutdown initiated", { signal });
  server.close(async () => {
    try {
      await db.$disconnect();
      await pool.end();
      logger.info("shutdown complete");
    } catch (err) {
      logger.error("shutdown error", { message: (err as Error).message });
    }
    process.exit(0);
  });

  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    logger.error("shutdown timeout — forcing exit");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

// ── Safety nets ───────────────────────────────────────────────────────────────
process.on("uncaughtException", (err) => {
  logger.error("uncaught exception", { message: err.message, stack: err.stack });
  shutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  logger.error("unhandled rejection", { reason: String(reason) });
  // Log but don't exit — most are recoverable in a personal app
});

export default app;
