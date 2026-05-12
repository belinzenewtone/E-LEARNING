# Next.js: Fetching Data & Server Components

## Why This Matters

Server Components can be async — they fetch data directly where it's rendered, without useEffect, useState, or loading spinners. This eliminates a whole class of bugs (race conditions, waterfall requests, flickering loaders) and dramatically simplifies your code.

## Core Concepts

### Fetching in Server Components

```tsx
// app/lessons/page.tsx — Server Component (default, no "use client")
import { db } from "@/lib/db";

export default async function LessonsPage() {
  const lessons = await db.lesson.findMany({
    orderBy: { createdAt: "desc" },
    include: { module: true },
  });

  return (
    <ul>
      {lessons.map((lesson) => (
        <li key={lesson.id}>
          {lesson.title} — {lesson.module.title}
        </li>
      ))}
    </ul>
  );
}
```

No `useEffect`, no `useState`, no loading state management. The page is rendered on the server and sent to the browser as HTML.

### Using Prisma in Server Components

```tsx
import { db } from "@/lib/db";

// Filtering and selecting
const completedAssignments = await db.assignment.findMany({
  where: { status: "completed" },
  select: { id: true, title: true, xpReward: true },
});

// Aggregation
const totalXp = await db.xpEvent.aggregate({
  where: { userId: session.user.id },
  _sum: { points: true },
});

// With relations
const userWithProgress = await db.user.findUnique({
  where: { id: userId },
  include: {
    progress: { include: { lesson: true } },
    studyLogs: { orderBy: { date: "desc" }, take: 10 },
  },
});
```

### React Suspense for Loading States

```tsx
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>
      <Suspense fallback={<ActivitySkeleton />}>
        <RecentActivity />
      </Suspense>
    </div>
  );
}

async function Stats() {
  const total = await db.xpEvent.aggregate({ _sum: { points: true } });
  return <div>Total XP: {total._sum.points}</div>;
}

function StatsSkeleton() {
  return <div className="animate-pulse h-20 bg-muted rounded" />;
}
```

Suspense lets each section load independently — fast data shows immediately, slow data gets a skeleton.

### Parallel Data Fetching

```tsx
// Sequential (slow — waits for each)
const user = await db.user.findUnique({ where: { id } });
const lessons = await db.lesson.findMany();
const assignments = await db.assignment.findMany();

// Parallel (fast — all requests fire simultaneously)
const [user, lessons, assignments] = await Promise.all([
  db.user.findUnique({ where: { id } }),
  db.lesson.findMany(),
  db.assignment.findMany(),
]);
```

### Passing Data to Client Components

```tsx
// Server Component fetches data, passes to Client Component
export default async function Page() {
  const data = await db.lesson.findMany();
  return <LessonClientGrid lessons={data} />;
}

// Client Component — receives data as props
"use client";
export function LessonClientGrid({ lessons }: { lessons: Lesson[] }) {
  const [search, setSearch] = useState("");
  const filtered = lessons.filter(l => l.title.includes(search));
  return (/* interactive grid with search */);
}
```

## Try It Yourself

1. Create a Server Component that fetches and displays a list of lessons.
2. Use Suspense to add a loading skeleton while data loads.
3. Fetch two unrelated datasets in parallel using `Promise.all`.
4. Pass server-fetched data to a Client Component that adds filtering.

## Common Mistakes

- **Waterfall requests**: Awaiting each query sequentially when they don't depend on each other. Use `Promise.all` instead.
- **Fetching in Client Components**: Client Components can't use `async/await` at the top level. Fetch in a parent Server Component and pass data down.
- **Not using Suspense boundaries**: Without Suspense, the whole page waits for the slowest query. Wrap independent sections in their own Suspense.

## Checkpoint

1. Why is it preferred to fetch data in Server Components?
2. What is a waterfall request and how do you prevent it?
3. How do you pass server-fetched data to a Client Component?
4. **Reflection**: Sketch the data fetching strategy for your dashboard.
