import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { PenLine, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { NotesClient } from "./notes-client";
import { Topbar } from "@/components/layout/topbar";

// ── page ──────────────────────────────────────────────────────────────────────

export default async function NotesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const notes = await db.note.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      lesson: { select: { id: true, title: true, slug: true } },
      assignment: { select: { id: true, title: true } },
      track: { select: { id: true, name: true, slug: true } },
    },
  });

  const tracks = await db.track.findMany({
    where: {
      notes: { some: { userId } },
    },
    select: { id: true, name: true, slug: true },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <Topbar title="Notes" subtitle="Your learning notes and reflections" />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Notes</h1>
          <p className="text-sm text-muted-foreground">
            {notes.length} note{notes.length !== 1 ? "s" : ""} in your collection.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/api/export/notes" download>
              <Download className="h-4 w-4" />
              Export
            </a>
          </Button>
          <Button asChild>
            <Link href="/notes/new">
              <Plus className="h-4 w-4" />
              Add Note
            </Link>
          </Button>
        </div>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={PenLine}
          title="No notes yet"
          description="Start capturing ideas, insights, and things you want to review later."
          action={{ label: "Add First Note", href: "/notes/new" }}
        />
      ) : (
        <NotesClient notes={notes} tracks={tracks} />
      )}
      </div>
    </div>
  );
}
