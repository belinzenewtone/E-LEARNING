"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

const ReviewSchema = z.object({
  submissionId: z.string().min(1),
  status: z.enum(["submitted", "reviewed", "approved", "needs-improvement"]),
  reviewerNotes: z.string().max(3000).optional(),
});

export async function reviewSubmission(formData: FormData) {
  await requireUserId();

  const parsed = ReviewSchema.safeParse({
    submissionId: formData.get("submissionId"),
    status: formData.get("status"),
    reviewerNotes: (formData.get("reviewerNotes") as string) || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { submissionId, status, reviewerNotes } = parsed.data;

  await db.submission.update({
    where: { id: submissionId },
    data: {
      status,
      reviewerNotes: reviewerNotes ?? null,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/assignments");
  revalidatePath("/dashboard");

  return { success: true };
}
