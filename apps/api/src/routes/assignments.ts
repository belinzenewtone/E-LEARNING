import { Router, Request, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { db } from "../lib/db";

const router = Router();

router.use(authenticate);

// GET /api/assignments
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const assignments = await db.assignment.findMany({
    orderBy: { dueDate: "asc" },
    include: {
      week: { select: { weekNumber: true, title: true } },
      track: { select: { name: true, slug: true, color: true } },
      submissions: {
        where: { userId },
        select: {
          id: true, status: true, submittedAt: true, selfScore: true,
          repoUrl: true, deploymentUrl: true, reflection: true,
        },
      },
    },
  });

  res.json(assignments);
});

// GET /api/assignments/overdue
router.get("/overdue", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const overdue = await db.assignment.findMany({
    where: {
      dueDate: { lt: new Date() },
      submissions: { none: { userId, status: { in: ["submitted", "approved", "reviewed"] } } },
    },
    orderBy: { dueDate: "asc" },
    include: {
      week: { select: { weekNumber: true, title: true } },
      track: { select: { name: true, slug: true, color: true } },
    },
  });

  res.json(overdue);
});

// GET /api/assignments/:id
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const { id } = req.params;

  const assignment = await db.assignment.findUnique({
    where: { id },
    include: {
      week: true,
      track: true,
      notes: { where: { userId }, orderBy: { createdAt: "desc" } },
      submissions: { where: { userId }, orderBy: { submittedAt: "desc" }, take: 1 },
    },
  });

  if (!assignment) { res.status(404).json({ error: "Assignment not found" }); return; }

  res.json(assignment);
});

export default router;
