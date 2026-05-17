import { db } from "./db";
import type { Prisma } from "@prisma/client";

export type SecurityEventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "LOGIN_LOCKED"
  | "LOGIN_RATE_LIMITED"
  | "LOGOUT"
  | "PASSWORD_CHANGE"
  | "DATA_EXPORT"
  | "SESSION_REVOKED";

export async function logSecurityEvent({
  type,
  userId,
  ip,
  userAgent,
  metadata,
}: {
  type: SecurityEventType;
  userId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.securityEvent.create({
      data: {
        type,
        userId: userId ?? null,
        ip: ip ?? null,
        userAgent: userAgent ?? null,
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch {
    // Logging must never crash the main flow
  }
}
