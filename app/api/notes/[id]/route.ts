import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const UpdateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  pinned: z.boolean().optional(),
  reviewLater: z.boolean().optional(),
  confusing: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const json = await request.json();
    const parsed = UpdateNoteSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const existing = await db.note.findUnique({ where: { id }, select: { userId: true } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await db.note.update({ where: { id }, data: parsed.data });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[api/notes/[id]] PATCH error:", err);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await db.note.findUnique({ where: { id }, select: { userId: true } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.note.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/notes/[id]] DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
