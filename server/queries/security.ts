import { db } from "@/lib/db";

export async function getSecurityEvents(userId: string, limit = 30) {
  return db.securityEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      type: true,
      ip: true,
      userAgent: true,
      metadata: true,
      createdAt: true,
    },
  });
}

export async function getSecurityStats(userId: string) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // last 30 days
  const [failures, successes, total] = await Promise.all([
    db.securityEvent.count({
      where: { userId, type: { in: ["LOGIN_FAILURE", "LOGIN_LOCKED"] }, createdAt: { gte: since } },
    }),
    db.securityEvent.count({
      where: { userId, type: "LOGIN_SUCCESS", createdAt: { gte: since } },
    }),
    db.securityEvent.count({ where: { userId } }),
  ]);
  return { failures, successes, total };
}
