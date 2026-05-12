# Server Actions & Forms

## Why This Matters

Server Actions eliminate the need for API routes for form submissions. You write a function with `"use server"`, call it directly from a form, and it runs on the server — no fetch, no route handler, no CORS. Combined with `revalidatePath`, your UI stays in sync automatically.

## Core Concepts

### Basic Server Action

```tsx
// server/actions/notes.ts
"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createNote(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  await db.note.create({
    data: { title, content, userId: "..." },
  });

  revalidatePath("/notes"); // re-render the notes page
}
```

```tsx
// app/notes/page.tsx
import { createNote } from "@/server/actions/notes";

export default function NotesPage() {
  return (
    <form action={createNote}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Create Note</button>
    </form>
  );
}
```

### Server Action with Validation

```tsx
"use server";
import { z } from "zod";

const NoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required"),
});

export async function createNote(prevState: unknown, formData: FormData) {
  const validated = NoteSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  await db.note.create({ data: validated.data });
  revalidatePath("/notes");
  return { success: true };
}
```

```tsx
// Client form with validation feedback
"use client";
import { useActionState } from "react";

export function NoteForm() {
  const [state, formAction, pending] = useActionState(createNote, null);

  return (
    <form action={formAction}>
      <input name="title" />
      {state?.error?.title && <p className="text-red-500">{state.error.title}</p>}
      <textarea name="content" />
      {state?.error?.content && <p className="text-red-500">{state.error.content}</p>}
      <button disabled={pending}>{pending ? "Creating..." : "Create Note"}</button>
    </form>
  );
}
```

### Non-Form Server Actions

```tsx
"use client";
import { completeLesson } from "@/server/actions/progress";

export function CompleteButton({ lessonId }: { lessonId: string }) {
  return (
    <button onClick={async () => {
      await completeLesson(lessonId);
      // UI updates automatically via revalidatePath
    }}>
      Mark Complete
    </button>
  );
}
```

### Optimistic Updates

```tsx
"use client";
import { useOptimistic } from "react";

export function LessonList({ lessons }: { lessons: Lesson[] }) {
  const [optimisticLessons, markComplete] = useOptimistic(
    lessons,
    (state, lessonId: string) =>
      state.map(l => l.id === lessonId ? { ...l, status: "completed" } : l)
  );

  async function handleComplete(lessonId: string) {
    markComplete(lessonId); // update UI immediately
    await completeLesson(lessonId); // actual server call
  }

  return (/* render optimisticLessons with Complete button */);
}
```

## Try It Yourself

1. Write a Server Action that creates a record in your database.
2. Add Zod validation to your Server Action with error feedback.
3. Use `useActionState` to show loading and error states.
4. Implement an optimistic update for a toggle action.

## Common Mistakes

- **Forgetting revalidatePath**: After a mutation, the page shows stale data. Always call `revalidatePath()` after writes.
- **Validation only on client**: Client-side validation is a UX convenience, not security. Always validate in the Server Action.
- **Redirect after action**: Use `redirect()` from `next/navigation` inside Server Actions to navigate after success.

## Checkpoint

1. What does `revalidatePath` do after a Server Action?
2. How do you return validation errors from a Server Action?
3. What is an optimistic update and why use it?
4. **Reflection**: Convert a form in your app to use Server Actions.
