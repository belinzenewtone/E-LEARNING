import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = session.user.id;

  const notes = await db.note.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: {
      title: true,
      content: true,
      tags: true,
      createdAt: true,
    },
  });

  const lines: string[] = [];

  for (const note of notes) {
    lines.push(`## ${note.title}`);
    lines.push("");
    if (note.tags.length > 0) {
      lines.push(`**Tags:** ${note.tags.join(", ")}`);
      lines.push("");
    }
    lines.push(note.content);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  const markdown = lines.join("\n");

  return new Response(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="notes.md"',
    },
  });
}
