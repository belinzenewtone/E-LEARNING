import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId: string;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies["auth-token"] as string | undefined;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as { sub: string };
    (req as AuthRequest).userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
