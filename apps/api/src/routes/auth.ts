import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../lib/db";
import { checkRateLimit } from "../lib/rate-limit";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

const COOKIE_NAME = "auth-token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

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

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const allowed = checkRateLimit(`auth:${email}`, 10, 15 * 60 * 1000);
  if (!allowed) {
    res.status(429).json({ error: "Too many login attempts. Try again in 15 minutes." });
    return;
  }

  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = issueToken(user.id);
  setCookie(res, token);

  res.json({
    user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
  });
});

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response): void => {
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
