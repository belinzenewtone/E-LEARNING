const isProd = process.env.NODE_ENV === "production";

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  ts: string;
  level: LogLevel;
  msg: string;
  [key: string]: unknown;
}

function write(level: LogLevel, msg: string, meta?: Record<string, unknown>) {
  const entry: LogEntry = { ts: new Date().toISOString(), level, msg, ...meta };
  if (isProd) {
    // PM2 captures stdout/stderr — JSON per line for log parsers
    const out = JSON.stringify(entry);
    if (level === "error") {
      process.stderr.write(out + "\n");
    } else {
      process.stdout.write(out + "\n");
    }
  } else {
    // Dev: human-readable
    const prefix = `[${entry.ts}] ${level.toUpperCase()}`;
    const extras = meta ? " " + JSON.stringify(meta) : "";
    console.log(`${prefix} ${msg}${extras}`);
  }
}

export const logger = {
  info:  (msg: string, meta?: Record<string, unknown>) => write("info",  msg, meta),
  warn:  (msg: string, meta?: Record<string, unknown>) => write("warn",  msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => write("error", msg, meta),
};

// Express request logger middleware
import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    const level: LogLevel = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    write(level, "request", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ms,
      ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ?? req.ip,
      ua: req.headers["user-agent"],
    });
  });
  next();
}
