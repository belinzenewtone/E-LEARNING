import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Avoid double-response if headers already sent
  if (res.headersSent) return;

  const status = (err as { status?: number; statusCode?: number }).status
    ?? (err as { statusCode?: number }).statusCode
    ?? 500;

  logger.error("unhandled error", {
    method: req.method,
    path: req.path,
    status,
    message: err.message,
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
  });

  res.status(status).json({
    error: status < 500 ? err.message : "Internal server error",
  });
}
