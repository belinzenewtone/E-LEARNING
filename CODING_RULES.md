# CODING_RULES.md

Conventions for this project. Follow these consistently.

---

## TypeScript

- **Strict mode always on** — `"strict": true` in tsconfig.json
- **No `any`** — use `unknown`, explicit type guards, or proper types
- **No type assertions** unless provably safe (`as` only when TypeScript can't infer)
- **Explicit return types** for all server functions and complex utilities
- **Zod for external data** — validate anything from FormData, API responses, or user input

```typescript
// ❌ Bad
async function getUser(id: any) { ... }

// ✅ Good
async function getUser(id: string): Promise<User | null> { ... }
```

---

## Components

- **Prefer Server Components** — default is server, add `"use client"` explicitly when needed
- **Single responsibility** — one clear purpose per component
- **Props interface at the top** — always name it `[ComponentName]Props`
- **No logic in UI primitives** — `components/ui/` components are style-only

```typescript
// ✅ Component structure
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
}

export function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (...)
}
```

---

## Naming

| Thing | Convention | Example |
|---|---|---|
| Component files | PascalCase | `StatCard.tsx`, `AiCoach.tsx` |
| Utility files | camelCase | `utils.ts`, `progress.ts` |
| Route directories | kebab-case | `study-log/`, `[weekNumber]/` |
| Database models | PascalCase | `WeekSprint`, `XpEvent` |
| Prisma fields | camelCase | `userId`, `weekId`, `createdAt` |
| Server actions | camelCase verbs | `completeLesson`, `submitAssignment` |
| Server queries | camelCase verbs | `getDashboardStats`, `getLessonBySlug` |

---

## Database

- **All Prisma reads** go in `server/queries/[feature].ts`
- **All Prisma writes** go in `server/actions/[feature].ts` with `"use server"`
- **Never use raw Prisma** in page files or components
- **Always revalidate** after mutations: `revalidatePath("/dashboard")`
- **Transactions for multi-step writes**: use `db.$transaction([...])`
- **Seed with upsert** — never use `create` in seed files (breaks re-seeding)

---

## Server Actions

```typescript
"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function doSomething(input: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.someModel.create({ data: { userId: session.user.id, value: input } });
  revalidatePath("/dashboard");
}
```

---

## UI Consistency

- **Status colors**: use `getStatusColor(status)` from `@/lib/utils`
- **Difficulty colors**: use `getDifficultyColor(difficulty)` from `@/lib/utils`
- **Dates**: always use `formatDate()` or `formatDateShort()` from `@/lib/utils`
- **Duration**: always use `minutesToHours()` from `@/lib/utils`
- **Empty states**: use `<EmptyState>` from `@/components/shared/empty-state`
- **Loading**: every page needs a `loading.tsx` sibling with skeleton content
- **Toasts**: use `toast.success()` / `toast.error()` from `sonner`

---

## What Not to Do

- **No hardcoded data** in pages or components — all content comes from the database
- **No `console.log`** in production code — use proper error handling
- **No inline styles** — use Tailwind classes
- **No duplicate components** — check `components/` before creating a new one
- **No fake/placeholder features** — every button should do something real
- **No copyrighted content** — lessons store only title, objective, source link, and personal notes

---

## Comments

Default: **no comments**. Add a comment only when:
- The code does something non-obvious that would surprise a future reader
- There's a specific constraint or workaround that must be preserved
- A business rule needs documentation that isn't obvious from variable names

Never:
- Comment what the code does (the code itself says that)
- Reference the current task or issue number in code comments
- Add `// TODO` comments that won't be acted on
