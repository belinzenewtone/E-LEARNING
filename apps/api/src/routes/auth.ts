import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../lib/db";
import { checkRateLimit } from "../lib/rate-limit";
import { authenticate, AuthRequest } from "../middleware/auth";
import { logSecurityEvent } from "../lib/security-event";

const router = Router();

const COOKIE_NAME = "auth-token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

function issueToken(userId: string): string {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign({ sub: userId }, secret, { expiresIn: "7d" });
}

function setCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(",")[0].trim();
  }
  return req.headers["x-real-ip"] as string ?? req.ip ?? "unknown";
}

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };
  const ip = getClientIp(req);
  const userAgent = req.headers["user-agent"] ?? "unknown";

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  // IP-level rate limit: 10 attempts per 15 minutes
  const allowed = checkRateLimit(`auth:${email}`, 10, 15 * 60 * 1000);
  if (!allowed) {
    await logSecurityEvent({ type: "LOGIN_RATE_LIMITED", ip, userAgent, metadata: { email } });
    res.status(429).json({ error: "Too many login attempts. Try again in 15 minutes." });
    return;
  }

  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    await logSecurityEvent({ type: "LOGIN_FAILURE", ip, userAgent, metadata: { email, reason: "user_not_found" } });
    // Generic error — don't reveal whether email exists
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  // Account lockout check
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    await logSecurityEvent({ type: "LOGIN_LOCKED", userId: user.id, ip, userAgent });
    res.status(423).json({
      error: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`,
    });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    const attempts = user.loginAttempts + 1;
    const shouldLock = attempts >= MAX_ATTEMPTS;
    await db.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: attempts,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCK_DURATION_MS) : null,
      },
    });

    await logSecurityEvent({
      type: shouldLock ? "LOGIN_LOCKED" : "LOGIN_FAILURE",
      userId: user.id,
      ip,
      userAgent,
      metadata: { attempts, locked: shouldLock },
    });

    if (shouldLock) {
      res.status(423).json({ error: "Account locked for 30 minutes due to too many failed attempts." });
    } else {
      res.status(401).json({
        error: `Invalid email or password. ${MAX_ATTEMPTS - attempts} attempt${MAX_ATTEMPTS - attempts !== 1 ? "s" : ""} remaining.`,
      });
    }
    return;
  }

  // Successful login — reset lockout counters
  await db.user.update({
    where: { id: user.id },
    data: { loginAttempts: 0, lockedUntil: null },
  });

  await logSecurityEvent({ type: "LOGIN_SUCCESS", userId: user.id, ip, userAgent });

  const token = issueToken(user.id);
  setCookie(res, token);

  res.json({
    user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
  });
});

// POST /api/auth/logout
router.post("/logout", authenticate, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const ip = getClientIp(req);
  const userAgent = req.headers["user-agent"] ?? "unknown";

  await logSecurityEvent({ type: "LOGOUT", userId, ip, userAgent });

  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ success: true });
});

// GET /api/auth/me
router.get("/me", authenticate, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, avatarUrl: true, theme: true, createdAt: true },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ user });
});

export default router;
