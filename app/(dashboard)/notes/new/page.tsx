import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { addNote } from "@/server/actions/progress";

export const metadata = {
  title: "New Note | Personal Learning OS",
};

export default async function NewNotePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [lessons, assignments, tracks] = await Promise.all([
    db.lesson.findMany({
      where: { progress: { some: { userId, status: { in: ["in-progress", "completed"] } } } },
      select: { id: true, title: true, slug: true },
      orderBy: { title: "asc" },
      take: 50,
    }),
    db.assignment.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
      take: 50,
    }),
    db.track.findMany({
      select: { id: true, name: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div>
      <Topbar
        title="New Note"
        breadcrumbs={[
          { label: "Notes", href: "/notes" },
          { label: "New Note" },
        ]}
      />
      <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8 space-y-6">
        <Card className="border-border/40 bg-card/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Create a New Note</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData: FormData) => {
                "use server";
                const result = await addNote(formData);
                if (result.success) {
                  redirect("/notes");
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Title
                </Label>
                <Input
                  name="title"
                  placeholder="e.g. React Hooks patterns"
                  required
                  maxLength={200}
                  className="bg-muted/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Content (Markdown supported)
                </Label>
                <Textarea
                  name="content"
                  placeholder="Write your note here..."
                  required
                  maxLength={10000}
                  className="min-h-[200px] resize-y bg-muted/20 font-mono text-sm"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Related Lesson
                  </Label>
                  <select
                    name="lessonId"
                    className="form-select flex h-9 w-full rounded-md border border-input bg-muted/20 px-3 py-1 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">None</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Related Assignment
                  </Label>
                  <select
                    name="assignmentId"
                    className="form-select flex h-9 w-full rounded-md border border-input bg-muted/20 px-3 py-1 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">None</option>
                    {assignments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Track
                </Label>
                <select
                  name="trackId"
                  className="form-select flex h-9 w-full rounded-md border border-input bg-muted/20 px-3 py-1 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">General</option>
                  {tracks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tags (comma separated)
                </Label>
                <Input
                  name="tags"
                  placeholder="react, hooks, patterns"
                  className="bg-muted/20"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" className="gap-2">
                  Save Note
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/notes">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
