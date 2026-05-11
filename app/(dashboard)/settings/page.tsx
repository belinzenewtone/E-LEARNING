import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { SettingsClient } from "./settings-client";

export const metadata = {
  title: "Settings | Personal Learning OS",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [user, goals, xpAgg] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, createdAt: true },
    }),
    db.goal.findMany({
      where: { userId },
      include: { track: { select: { name: true, color: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.xpEvent.aggregate({ where: { userId }, _sum: { points: true } }),
  ]);

  return (
    <div>
      <Topbar title="Settings" subtitle="Profile and preferences" />
      <SettingsClient
        user={user}
        goals={goals}
        xpTotal={xpAgg._sum.points ?? 0}
      />
    </div>
  );
}
