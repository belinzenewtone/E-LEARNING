"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  Pin,
  BookmarkCheck,
  AlertCircle,
  Pencil,
  Trash2,
  ExternalLink,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

// ── server actions (inline for notes) ─────────────────────────────────────────
// These perform raw fetch mutations. Because addNote only creates, we need
// dedicated update/delete actions — we'll call API routes instead.

interface NoteData {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  reviewLater: boolean;
  confusing: boolean;
  createdAt: Date;
  updatedAt: Date;
  lessonId: string | null;
  assignmentId: string | null;
  lesson: { id: string; title: string; slug: string } | null;
  assignment: { id: string; title: string } | null;
  track: { id: string; name: string } | null;
}

interface NoteDetailClientProps {
  note: NoteData;
}

export function NoteDetailClient({ note: initialNote }: NoteDetailClientProps) {
  const router = useRouter();
  const [note, setNote] = useState(initialNote);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  async function patchNote(updates: Record<string, unknown>) {
    const res = await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update note");
    const data = (await res.json()) as Partial<NoteData>;
    return data;
  }

  function handleSaveEdit() {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error("Title and content are required.");
      return;
    }
    startTransition(async () => {
      try {
        await patchNote({ title: editTitle, content: editContent });
        setNote((prev) => ({
          ...prev,
          title: editTitle,
          content: editContent,
        }));
        setEditing(false);
        toast.success("Note updated.");
      } catch {
        toast.error("Failed to update note.");
      }
    });
  }

  function handleToggle(field: "pinned" | "reviewLater" | "confusing") {
    const newVal = !note[field];
    startTransition(async () => {
      try {
        await patchNote({ [field]: newVal });
        setNote((prev) => ({ ...prev, [field]: newVal }));
      } catch {
        toast.error("Failed to update note.");
      }
    });
  }

  function handleDelete() {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    startDeleting(async () => {
      try {
        const res = await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        toast.success("Note deleted.");
        router.push("/notes");
      } catch {
        toast.error("Failed to delete note.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        {editing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="text-xl font-bold bg-muted/20"
            autoFocus
          />
        ) : (
          <h1 className="text-2xl font-bold text-foreground">{note.title}</h1>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground border border-border/40"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Timestamps */}
        <p className="text-xs text-muted-foreground">
          Created {formatDateTime(note.createdAt)}
          {note.updatedAt !== note.createdAt &&
            ` · Updated ${formatDateTime(note.updatedAt)}`}
        </p>
      </div>

      {/* Flags row */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleToggle("pinned")}
          disabled={isPending}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            note.pinned
              ? "border-[var(--token-amber)]/30 bg-[var(--token-amber)]/10 text-[var(--token-amber)]"
              : "border-border/50 text-muted-foreground hover:text-foreground"
          )}
        >
          <Pin className="h-3 w-3" />
          {note.pinned ? "Pinned" : "Pin"}
        </button>

        <button
          onClick={() => handleToggle("reviewLater")}
          disabled={isPending}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            note.reviewLater
              ? "border-[var(--token-cyan)]/30 bg-[var(--token-cyan)]/10 text-[var(--token-cyan)]"
              : "border-border/50 text-muted-foreground hover:text-foreground"
          )}
        >
          <BookmarkCheck className="h-3 w-3" />
          {note.reviewLater ? "Review Later" : "Mark Review Later"}
        </button>

        <button
          onClick={() => handleToggle("confusing")}
          disabled={isPending}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            note.confusing
              ? "border-[var(--token-red)]/30 bg-[var(--token-red)]/10 text-[var(--token-red)]"
              : "border-border/50 text-muted-foreground hover:text-foreground"
          )}
        >
          <AlertCircle className="h-3 w-3" />
          {note.confusing ? "Confusing" : "Mark Confusing"}
        </button>

        <div className="flex-1" />

        {!editing && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
        {editing && (
          <>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={isPending}
            >
              <Check className="h-3.5 w-3.5" />
              {isPending ? "Saving…" : "Save"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setEditTitle(note.title);
                setEditContent(note.content);
              }}
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
          </>
        )}
      </div>

      <Separator />

      {/* Content */}
      {editing ? (
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Content (Markdown supported)
          </Label>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[300px] resize-y bg-muted/20 font-mono text-sm"
          />
        </div>
      ) : (
        <Card className="border-border/40 bg-card/60">
          <CardContent className="p-5">
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related links */}
      {(note.lesson || note.assignment) && (
        <>
          <Separator />
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Related
            </p>
            {note.lesson && (
              <Button size="sm" variant="outline" asChild>
                <Link href={`/lessons/${note.lesson.slug}`}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  Lesson: {note.lesson.title}
                </Link>
              </Button>
            )}
            {note.assignment && (
              <Button size="sm" variant="outline" asChild>
                <Link href={`/assignments/${note.assignment.id}`}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  Assignment: {note.assignment.title}
                </Link>
              </Button>
            )}
          </div>
        </>
      )}

      <Separator />

      {/* Delete */}
      <div className="flex justify-end">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {isDeleting ? "Deleting…" : "Delete Note"}
        </Button>
      </div>
    </div>
  );
}
