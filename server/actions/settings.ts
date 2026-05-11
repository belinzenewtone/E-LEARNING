"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  avatar: z.string().max(10).optional(),
});

const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export async function updateProfile(formData: FormData) {
  const userId = await requireUserId();

  const raw = {
    name: formData.get("name"),
  };

  const parsed = UpdateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      ...(parsed.data.avatar ? { avatarUrl: parsed.data.avatar } : {}),
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const userId = await requireUserId();

  const raw = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  };

  const parsed = UpdatePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Current password is incorrect" };
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  return { success: true };
}

export async function resetAllProgress() {
  const userId = await requireUserId();

  await db.$transaction([
    db.xpEvent.deleteMany({ where: { userId } }),
    db.studyLog.deleteMany({ where: { userId } }),
    db.progress.deleteMany({ where: { userId } }),
    db.submission.deleteMany({ where: { userId } }),
    db.lessonCheckpointAnswer.deleteMany({ where: { userId } }),
    db.note.deleteMany({ where: { userId } }),
    db.goal.deleteMany({ where: { userId } }),
    db.weekSprint.updateMany({
      where: {},
      data: { retrospectiveCompleted: false, retrospectiveNotes: null, status: "locked" },
    }),
    db.lesson.updateMany({
      where: {},
      data: { status: "locked" },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/settings");

  return { success: true };
}
