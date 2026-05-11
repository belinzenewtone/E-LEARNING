"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

interface SearchResult {
  id: string;
  title: string;
  href: string;
}

interface GlobalSearchResults {
  lessons: SearchResult[];
  assignments: SearchResult[];
  notes: SearchResult[];
}

export async function globalSearch(query: string): Promise<GlobalSearchResults> {
  const trimmed = query.trim();

  if (trimmed.length < 2) {
    return { lessons: [], assignments: [], notes: [] };
  }

  const session = await auth();
  const userId = session?.user?.id;

  const [lessons, assignments, notes] = await Promise.all([
    db.lesson.findMany({
      where: {
        title: { contains: trimmed, mode: "insensitive" },
      },
      select: { id: true, title: true, slug: true },
      take: 5,
    }),

    db.assignment.findMany({
      where: {
        title: { contains: trimmed, mode: "insensitive" },
      },
      select: { id: true, title: true, weekId: true },
      take: 5,
    }),

    userId
      ? db.note.findMany({
          where: {
            userId,
            OR: [
              { title: { contains: trimmed, mode: "insensitive" } },
              { content: { contains: trimmed, mode: "insensitive" } },
            ],
          },
          select: { id: true, title: true },
          take: 5,
        })
      : Promise.resolve([]),
  ]);

  return {
    lessons: lessons.map((l) => ({
      id: l.id,
      title: l.title,
      href: `/lessons/${l.slug}`,
    })),
    assignments: assignments.map((a) => ({
      id: a.id,
      title: a.title,
      href: `/assignments/${a.id}`,
    })),
    notes: notes.map((n) => ({
      id: n.id,
      title: n.title,
      href: `/notes/${n.id}`,
    })),
  };
}
