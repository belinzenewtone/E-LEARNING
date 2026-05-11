<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Personal Learning OS — Agent Instructions

## Project Overview

A Next.js 16 App Router personal learning platform. TypeScript strict mode. Prisma + PostgreSQL. NextAuth v5 credentials auth. shadcn/ui + Tailwind CSS v4 (dark-mode-first palette). Path alias `@/*` = project root.

## Architecture Rules

### Server vs Client
- Default to Server Components. Add `"use client"` only for: useState, useEffect, event handlers, browser APIs.
- Data fetching: Server Components or `server/queries/`.
- Mutations: Server Actions in `server/actions/` (use `"use server"` directive).
- Split: Server wrapper (data) + Client child (interactivity).

### File Organization
```
server/queries/     — DB read queries
server/actions/     — "use server" mutations (always revalidatePath after writes)
lib/                — DB client, auth, XP engine, utils
components/ui/      — shadcn/ui primitives only
components/shared/  — Reusable app-level UI
app/(dashboard)/    — Protected route pages
```

## Adding Features

1. Schema change → `prisma/schema.prisma` → `npm run db:migrate`
2. New query → `server/queries/[feature].ts`
3. New mutation → `server/actions/[feature].ts` with `"use server"`
4. New page → `app/(dashboard)/[route]/page.tsx`
5. New test → `tests/[feature].spec.ts`

## Adding Curriculum Items

Edit `prisma/seed.ts` → add to `webLessons` or `dataLessons` arrays → `npm run db:seed`.

Each lesson needs: week, module (slug), title, slug (unique), objective, sourceName, sourceType, sourceUrl, estimatedMinutes, order, difficulty, keyConcepts[], checkpointQuestions[].

## Code Style

- No `any`. Use `unknown` or proper types.
- Named exports for components.
- Prisma queries only in `server/queries/`.
- Dates: use `date-fns`, never `toLocaleDateString()`.
- Colors: use `getStatusColor()` and `getDifficultyColor()` from `@/lib/utils`.

## Running Tests

```bash
npm test                                    # All E2E tests
npx tsx tests/progress.unit.test.ts         # Unit tests
```
