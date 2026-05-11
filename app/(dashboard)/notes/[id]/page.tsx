import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { NoteDetailClient } from "./note-detail-client";

// ── page ──────────────────────────────────────────────────────────────────────

interface NoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const { id } = await params;

  const note = await db.note.findUnique({
    where: { id },
    include: {
      lesson: { select: { id: true, title: true, slug: true } },
      assignment: { select: { id: true, title: true } },
      track: { select: { id: true, name: true } },
    },
  });

  if (!note || note.userId !== userId) notFound();

  return (
    <div>
      <Topbar
        title="Note Detail"
        breadcrumbs={[
          { label: "Notes", href: "/notes" },
          { label: note.title },
        ]}
      />
      <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">
        <NoteDetailClient
          note={{
            id: note.id,
            title: note.title,
            content: note.content,
            tags: note.tags,
            pinned: note.pinned,
            reviewLater: note.reviewLater,
            confusing: note.confusing,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
            lessonId: note.lessonId,
            assignmentId: note.assignmentId,
            lesson: note.lesson,
            assignment: note.assignment,
            track: note.track,
          }}
        />
      </div>
    </div>
  );
}
