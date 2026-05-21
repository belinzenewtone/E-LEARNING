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
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

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
        setNote((prev) => ({ ...prev, title: editTitle, content: editContent }));
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2 border-b border-border/40 pb-6">
        <p className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/80">
          SYSTEM // NOTE DETAIL
        </p>
        {editing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="text-2xl font-bold bg-muted/20"
            autoFocus
          />
        ) : (
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{note.title}</h1>
        )}

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border bg-muted/40 text-muted-foreground border-border"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
          CREATED {formatDateTime(note.createdAt).toUpperCase()}
          {note.updatedAt !== note.createdAt && ` · UPDATED ${formatDateTime(note.updatedAt).toUpperCase()}`}
        </p>
      </div>

      {/* Flags row */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleToggle("pinned")}
          disabled={isPending}
          className={cn(
            "flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider px-3 py-1 rounded border transition-colors",
            note.pinned
              ? "border-[var(--token-amber)]/30 bg-[var(--token-amber)]/10 text-[var(--token-amber)]"
              : "border-border/80 text-muted-foreground hover:text-foreground"
          )}
        >
          <Pin className="h-3 w-3" />
          {note.pinned ? "PINNED" : "PIN"}
        </button>

        <button
          onClick={() => handleToggle("reviewLater")}
          disabled={isPending}
          className={cn(
            "flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider px-3 py-1 rounded border transition-colors",
            note.reviewLater
              ? "border-[var(--token-cyan)]/30 bg-[var(--token-cyan)]/10 text-[var(--token-cyan)]"
              : "border-border/80 text-muted-foreground hover:text-foreground"
          )}
        >
          <BookmarkCheck className="h-3 w-3" />
          {note.reviewLater ? "REVIEW LATER" : "MARK REVIEW LATER"}
        </button>

        <button
          onClick={() => handleToggle("confusing")}
          disabled={isPending}
          className={cn(
            "flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider px-3 py-1 rounded border transition-colors",
            note.confusing
              ? "border-[var(--token-red)]/30 bg-[var(--token-red)]/10 text-[var(--token-red)]"
              : "border-border/80 text-muted-foreground hover:text-foreground"
          )}
        >
          <AlertCircle className="h-3 w-3" />
          {note.confusing ? "CONFUSING" : "MARK CONFUSING"}
        </button>

        <div className="flex-1" />

        {!editing && (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="border-border hover:bg-muted text-xs font-mono uppercase tracking-wider">
            <Pencil className="h-3.5 w-3.5" />
            EDIT
          </Button>
        )}
        {editing && (
          <>
            <Button size="sm" onClick={handleSaveEdit} disabled={isPending} className="font-mono text-xs font-semibold uppercase tracking-wider">
              <Check className="h-3.5 w-3.5" />
              {isPending ? "SAVING…" : "SAVE"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setEditTitle(note.title);
                setEditContent(note.content);
              }}
              className="text-xs font-mono uppercase tracking-wider"
            >
              <X className="h-3.5 w-3.5" />
              CANCEL
            </Button>
          </>
        )}
      </div>

      {/* Content */}
      {editing ? (
        <div className="space-y-2">
          <Label className="text-[10px] font-mono font-semibold text-muted-foreground/80 uppercase tracking-widest">
            CONTENT (MARKDOWN SUPPORTED)
          </Label>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[300px] resize-y bg-muted/20 font-mono text-sm"
          />
        </div>
      ) : (
        <Card data-slot="card" className="border border-border/80 bg-card/60 rounded-xl">
          <CardContent className="p-5">
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related links */}
      {(note.lesson || note.assignment) && (
        <div className="space-y-2 border-t border-border/40 pt-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 font-mono">RELATED</p>
          <div className="flex flex-wrap gap-2">
            {note.lesson && (
              <Button size="sm" variant="outline" asChild className="border-border hover:bg-muted text-xs font-mono uppercase tracking-wider">
                <Link href={`/lessons/${note.lesson.slug}`}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  LESSON · {note.lesson.title}
                </Link>
              </Button>
            )}
            {note.assignment && (
              <Button size="sm" variant="outline" asChild className="border-border hover:bg-muted text-xs font-mono uppercase tracking-wider">
                <Link href={`/assignments/${note.assignment.id}`}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  ASSIGN · {note.assignment.title}
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Delete */}
      <div className="flex justify-end border-t border-border/40 pt-5">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="font-mono text-xs font-semibold uppercase tracking-wider"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {isDeleting ? "DELETING…" : "DELETE NOTE"}
        </Button>
      </div>
    </div>
  );
}
