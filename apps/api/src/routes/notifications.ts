import { Router, Request, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { db } from "../lib/db";
import { startOfDay, endOfDay, subDays } from "date-fns";

const router = Router();

router.use(authenticate);

// GET /api/notifications
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const notifications = await db.notification.findMany({
    where: { userId },
    orderBy: [{ read: "asc" }, { createdAt: "desc" }],
    take: 20,
  });

  res.json(notifications);
});

// GET /api/notifications/unread-count
router.get("/unread-count", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const count = await db.notification.count({ where: { userId, read: false } });
  res.json({ count });
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  await db.notification.updateMany({
    where: { id: req.params.id, userId },
    data: { read: true },
  });

  res.json({ success: true });
});

// PATCH /api/notifications/read-all
router.patch("/read-all", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  await db.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  res.json({ success: true });
});

// POST /api/notifications/generate — run notification checks for the user
router.post("/generate", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const now = new Date();
  const created: string[] = [];

  // 1. Overdue assignments
  const overdueAssignments = await db.assignment.findMany({
    where: {
      dueDate: { lt: now },
      submissions: { none: { userId, status: { in: ["submitted", "approved", "reviewed"] } } },
    },
    select: { id: true, title: true },
  });

  if (overdueAssignments.length > 0) {
    const overdueHrefs = overdueAssignments.map((a) => `/assignments/${a.id}`);
    const existingNotifs = await db.notification.findMany({
      where: { userId, type: "overdue_assignment", read: false, href: { in: overdueHrefs } },
      select: { href: true },
    });
    const notifiedHrefs = new Set(existingNotifs.map((n) => n.href));

    const newData = overdueAssignments
      .filter((a) => !notifiedHrefs.has(`/assignments/${a.id}`))
      .map((a) => ({
        userId, type: "overdue_assignment",
        title: "Overdue Assignment",
        body: `"${a.title}" is past due and hasn't been submitted yet.`,
        href: `/assignments/${a.id}`,
        read: false,
      }));

    if (newData.length > 0) {
      await db.notification.createMany({ data: newData });
      created.push(...newData.map((d) => d.href!));
    }
  }

  // 2. Streak at risk
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const [todayLog, yesterdayLog] = await Promise.all([
    db.studyLog.findFirst({ where: { userId, date: { gte: todayStart, lte: todayEnd } } }),
    db.studyLog.findFirst({
      where: { userId, date: { gte: startOfDay(subDays(now, 1)), lte: endOfDay(subDays(now, 1)) } },
    }),
  ]);

  if (!todayLog && yesterdayLog) {
    const existing = await db.notification.findFirst({
      where: { userId, type: "streak_risk", read: false, createdAt: { gte: todayStart, lte: todayEnd } },
    });
    if (!existing) {
      const n = await db.notification.create({
        data: {
          userId, type: "streak_risk",
          title: "Streak at Risk!",
          body: "You studied yesterday but haven't logged any study time today.",
          href: "/study-log", read: false,
        },
      });
      created.push(n.id);
    }
  }

  res.json({ created });
});

export default router;
