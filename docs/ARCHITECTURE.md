# Architecture

## System Overview

```
Browser
  │
  ▼
Next.js 16 App Router (Vercel)
  ├── app/(dashboard)/      → Protected pages (Server Components)
  ├── app/login/            → Auth page (Client Component)
  ├── app/api/              → Route handlers (analytics data)
  │
  ├── Server Actions        → Mutations (completeLesson, submitAssignment, etc.)
  ├── Server Queries        → DB reads (getDashboardStats, getLessonBySlug, etc.)
  │
  ▼
Prisma ORM
  │
  ▼
PostgreSQL (Neon / Supabase)
```

---

## Auth Architecture

Uses NextAuth v5 (beta) with credentials provider.

Flow:
1. User visits any protected route → middleware intercepts
2. Middleware checks `auth()` session — redirects to `/login` if not authenticated
3. Login form calls `signIn("credentials", { email, password })`
4. NextAuth calls `authorize()` → bcrypt.compare → returns user if valid
5. JWT stored in httpOnly cookie
6. `auth()` on server reads JWT and returns session

Single user model: one admin user seeded from env vars. No public registration.

---

## Database Design

### Core entities

```
User
  └── has many: Notes, StudyLogs, XpEvents, ProgressSnapshots, Submissions, Progress

Track (Web | Data Engineering)
  └── has many: Modules

Module
  └── belongs to: Track
  └── has many: Lessons

WeekSprint
  └── has many: Lessons, Assignments

Lesson
  └── belongs to: Module, WeekSprint
  └── has many: Notes, XpEvents, LessonCheckpointAnswers

Assignment
  └── belongs to: WeekSprint, Track?
  └── has many: Submissions, Notes

Submission
  └── belongs to: Assignment, User
```

### Progress tracking

Lesson completion is tracked via `Progress` records (userId + lessonId + status=completed).

Track progress = completed lessons in track / total lessons in track × 100.

Weekly score = 40% lesson rate + 40% assignment rate + 10% study consistency + 10% retro.

---

## XP System

XP events are immutable append-only records. Total XP = sum of all XpEvent.points for userId.

| Action | XP |
|---|---|
| Complete lesson | +20 |
| Answer checkpoint | +10 |
| Submit assignment | +80 |
| Complete retrospective | +30 |
| Add study log | +10 |
| Add note | +5 |
| Complete capstone | +150 |

---

## Streak System

A streak day counts when `StudyLog.minutes >= 30` for that day.

Algorithm:
1. Fetch all study logs from the last 60 days
2. Walk backwards from today
3. If today has no log yet: skip (don't break streak — you might log later)
4. If yesterday had >= 30 min: increment streak, continue walking back
5. If a gap is found: stop

---

## Caching Strategy

- Server Components are statically rendered by default
- `revalidatePath("/dashboard")` called after every mutation
- Analytics API route: no cache headers (always fresh)
- Consider `revalidateTag` for more granular invalidation as the app grows

---

## Progress Engine (Pure Functions)

`lib/progress.ts` contains pure functions with no database calls:

```typescript
calculateStreak(logs: { date: Date; minutes: number }[]): number
calculateWeeklyScore(params: {...}): number  // 0-100
calculateXpTotal(events: { points: number }[]): number
isLessonCompletable(params: {...}): boolean
isAssignmentSubmittable(params: {...}): boolean
```

These can be tested without a database and used in both client and server contexts.

---

## Component Architecture

```
Page (Server Component)
  ├── Fetches data via server/queries/
  ├── Passes serialized data to Client Components
  └── Wraps interactive sections in <Suspense>
       │
       └── Client Component ("use client")
            ├── Receives data as props
            ├── Manages local state (filters, form inputs)
            └── Calls Server Actions for mutations
```

---

## AI Coach

The AI Coach panel is a Client Component with:
1. 7 predefined coaching actions (buttons)
2. A chat-like message thread
3. Mock responses for demo mode (no API key)
4. Future: real Anthropic API calls when `ANTHROPIC_API_KEY` is set

The coach never invents progress data. In production, it would receive:
- User's recent notes (from DB)
- Current week goals
- XP events summary
- Active assignment brief

---

## Deployment Architecture

```
GitHub Repo
  │
  ▼
Vercel (Next.js deployment)
  ├── Build: npm run build (Prisma generate included)
  ├── Runtime: Node.js edge or serverless
  │
  └── Environment Variables:
       DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL,
       ADMIN_EMAIL, ADMIN_PASSWORD, ANTHROPIC_API_KEY
  │
  ▼
Neon Postgres (serverless PostgreSQL)
  ├── Connection pooling enabled
  └── 22-week curriculum data
```
