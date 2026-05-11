import { db } from "@/lib/db";

export async function syncWeekStatuses(): Promise<void> {
  const now = new Date();

  const weeks = await db.weekSprint.findMany({
    select: { id: true, weekNumber: true, startDate: true, endDate: true, status: true },
    orderBy: { weekNumber: "asc" },
  });

  for (const week of weeks) {
    const start = new Date(week.startDate);
    const end = new Date(week.endDate);
    end.setHours(23, 59, 59, 999);

    let targetStatus: string;
    if (now >= start && now <= end) {
      targetStatus = "active";
    } else if (now > end) {
      targetStatus = "completed";
    } else {
      targetStatus = "locked";
    }

    if (targetStatus !== week.status) {
      await db.weekSprint.update({
        where: { id: week.id },
        data: { status: targetStatus },
      });

      // When a week becomes active, unlock all its lessons
      if (targetStatus === "active") {
        await db.lesson.updateMany({
          where: { weekId: week.id, status: "locked" },
          data: { status: "available" },
        });
      }
    }
  }
}
