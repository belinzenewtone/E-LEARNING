"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

// ── markNotificationRead ──────────────────────────────────────────────────────

export async function markNotificationRead(id: string) {
  const userId = await requireUserId();

  await db.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

// ── markAllRead ───────────────────────────────────────────────────────────────

export async function markAllRead(userId: string) {
  const authedUserId = await requireUserId();

  // Guard: only allow marking your own notifications
  if (authedUserId !== userId) {
    return { success: false, error: "Unauthorized" };
  }

  await db.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
