import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { format } from "date-fns";

function escapeCsv(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = session.user.id;

  const logs = await db.studyLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    select: {
      date: true,
      minutes: true,
      mood: true,
      energy: true,
      learned: true,
      blockers: true,
      track: {
        select: { name: true },
      },
    },
  });

  const header = ["Date", "Minutes", "Hours", "Track", "Mood", "Energy", "Learned", "Blockers"];
  const rows = logs.map((log) => [
    escapeCsv(format(new Date(log.date), "yyyy-MM-dd")),
    escapeCsv(String(log.minutes)),
    escapeCsv(String(Math.round((log.minutes / 60) * 100) / 100)),
    escapeCsv(log.track?.name ?? ""),
    escapeCsv(log.mood ?? ""),
    escapeCsv(log.energy != null ? String(log.energy) : ""),
    escapeCsv(log.learned ?? ""),
    escapeCsv(log.blockers ?? ""),
  ]);

  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="study-log.csv"',
    },
  });
}
