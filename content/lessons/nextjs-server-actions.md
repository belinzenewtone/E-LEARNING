# Server Actions & Forms

## 🎯 By End of This Lesson You Will:
- Define and call Server Actions for mutations
- Build forms that submit without writing API routes
- Use `revalidatePath` to refresh data after a mutation

---

## 🌍 Real-World Analogy First

Before Server Actions, every mutation (create, update, delete) needed:

```
1. Create an API route          (/api/lessons/route.ts)
2. Write fetch() in the client
3. Handle response in the client
4. Re-fetch the data to update UI
```

Server Actions condense all that into a single **`"use server"` function**:

```
1. Define an async function with "use server"
2. Pass it directly to a form's action prop
3. Done. Next.js handles everything else.
```

It's like calling a server function as if it were local — but Next.js handles the network/serialization invisibly.

---

## 📖 Start From Zero

### Your First Server Action

```tsx
// app/lessons/new/page.tsx
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

async function createLesson(formData: FormData) {
  "use server";

  const title = formData.get("title") as string;
  await db.lesson.create({ data: { title, slug: title.toLowerCase() } });

  redirect("/lessons");
}

export default function NewLessonPage() {
  return (
    <form action={createLesson}>
      <input name="title" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

Read it:
- `"use server"` at the top of the function = "this runs on the server"
- The form's `action` is the server function (not a URL!)
- When the user submits, Next.js calls the function on the server with the FormData

No API route. No `fetch`. No `useState`. It just works.

---

## 🔨 Level Up

### Step 1: Separating Actions into Their Own Files

```typescript
// server/actions/lessons.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createLesson(formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;

  await db.lesson.create({ data: { title, slug } });
  revalidatePath("/lessons");
}

export async function deleteLesson(id: string) {
  await db.lesson.delete({ where: { id } });
  revalidatePath("/lessons");
}
```

Now import and use:

```tsx
import { createLesson } from "@/server/actions/lessons";

<form action={createLesson}>...</form>
```

> **Best practice:** Put all server actions in `server/actions/`. Pages just import and use them.

---

### Step 2: revalidatePath — Refresh Data After Mutation

After a mutation, the page's cached data is stale. `revalidatePath` clears the cache:

```typescript
"use server";
import { revalidatePath } from "next/cache";

export async function createLesson(data: FormData) {
  await db.lesson.create({ /* ... */ });
  revalidatePath("/lessons");   // ← UI on /lessons re-fetches fresh data
}
```

Without `revalidatePath`, the user sees the old data until next navigation.

### Step 3: Validation with Zod

```typescript
"use server";
import { z } from "zod";

const LessonSchema = z.object({
  title: z.string().min(3, "Title too short"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Invalid slug"),
  estimatedMinutes: z.coerce.number().int().positive()
});

export async function createLesson(formData: FormData) {
  const raw = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    estimatedMinutes: formData.get("estimatedMinutes")
  };

  const result = LessonSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  await db.lesson.create({ data: result.data });
  revalidatePath("/lessons");
  return { success: true };
}
```

Always validate. Never trust raw FormData.

---

### Step 4: useFormStatus — Loading State

```tsx
"use client";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </button>
  );
}

// Parent page (Server Component)
export default function Page() {
  return (
    <form action={createLesson}>
      <input name="title" />
      <SubmitButton />
    </form>
  );
}
```

`useFormStatus` works automatically inside any form — no manual state needed.

---

### Step 5: useFormState (now useActionState) — Errors and Result

```tsx
"use client";
import { useActionState } from "react";
import { createLesson } from "@/server/actions/lessons";

export function NewLessonForm() {
  const [state, formAction] = useActionState(createLesson, { error: null });

  return (
    <form action={formAction}>
      <input name="title" />
      {state?.error?.title?.[0] && <p className="text-red-600">{state.error.title[0]}</p>}
      <button>Save</button>
    </form>
  );
}
```

The action returns a result; the hook stores it for display.

---

### Step 6: Direct Function Calls (Not Just Forms)

Server Actions can be called from any client code:

```tsx
"use client";
import { deleteLesson } from "@/server/actions/lessons";

export function DeleteButton({ id }: { id: string }) {
  return (
    <button onClick={async () => {
      if (confirm("Sure?")) {
        await deleteLesson(id);
      }
    }}>
      Delete
    </button>
  );
}
```

---

### Step 7: redirect After Action

```typescript
"use server";
import { redirect } from "next/navigation";

export async function createLesson(formData: FormData) {
  const lesson = await db.lesson.create({ /* ... */ });
  redirect(`/lessons/${lesson.slug}`);
}
```

`redirect` throws an error internally — must be called OUTSIDE try/catch blocks (or it'll get caught).

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Basic action:**
```tsx
// Server action createNote that creates a note from FormData
// Form that submits to it
```

**Exercise 2 — Validate:**
```typescript
// Add Zod validation to createNote
// Return errors when validation fails
```

**Exercise 3 — revalidatePath:**
```typescript
// After creating, revalidate /notes so the new note shows
```

**Exercise 4 — Loading state:**
```tsx
// Add a SubmitButton component using useFormStatus to show "Saving..." text while pending
```

**Exercise 5 — Error display:**
```tsx
// Use useActionState to show error messages from a validation failure
```

**Exercise 6 — Delete action:**
```tsx
// Server action deleteNote(id)
// Delete button on each note that calls it
```

**Exercise 7 — Redirect:**
```typescript
// After creating, redirect to the new note's detail page
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Missing `"use server"` | Function runs on client (with no DB access) | Add the directive |
| No validation | Trust unfiltered FormData | Always validate with Zod |
| Missing `revalidatePath` | Stale UI after mutation | Call after every mutation |
| `redirect` inside try/catch | Caught as an error | Call outside the try block |
| Server Action in Client Component file | Mixed concerns | Define in `server/actions/`, import in client |

---

## 🧠 Mental Model

```
Server Action = function that:
  • has "use server" at the top
  • is async
  • runs on the server
  • can be passed to <form action={fn}> or called directly

After mutation:
  revalidatePath("/path")   refresh that page's cached data
  redirect("/path")          send the user elsewhere

For UX:
  useFormStatus()            { pending } — loading state
  useActionState(fn, init)   error/state from action
```

---

## 📝 Check Your Understanding

1. **Define:** What does `"use server"` do?
2. **Predict:** Does this work?
   ```tsx
   "use client";
   async function save() { "use server"; ... }
   ```
3. **Find the bug:**
   ```typescript
   "use server";
   export async function createNote(data) {
     await db.note.create({ data });
     // UI doesn't refresh — why?
   }
   ```
4. **Write it:** A form with two fields (title, body), Zod validation, action that creates a record + revalidates + redirects.
5. **Apply it:** Replace an API route + fetch call with a Server Action.
6. **Reflect:** Server Actions blur server/client. What's the tradeoff vs traditional REST APIs?
