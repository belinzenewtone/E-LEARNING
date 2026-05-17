import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { getSecurityEvents, getSecurityStats } from "@/server/queries/security";
import { SecurityClient } from "./security-client";

export const metadata = {
  title: "Security | Personal Learning OS",
};

export default async function SecurityPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [events, stats] = await Promise.all([
    getSecurityEvents(userId, 30),
    getSecurityStats(userId),
  ]);

  return (
    <div>
      <Topbar title="Security" subtitle="Login history and session management" />
      <SecurityClient events={events} stats={stats} />
    </div>
  );
}
