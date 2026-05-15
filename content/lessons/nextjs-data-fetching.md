# Next.js: Fetching Data & Server Components

## 🎯 By End of This Lesson You Will:
- Fetch data inside Server Components with async/await
- Use Prisma queries directly in components
- Use Suspense and `loading.tsx` for smooth UX

---

## 🌍 Real-World Analogy First

In a traditional React app, **data fetching happens in the browser** (after the page loads):

```
1. Browser receives empty HTML shell
2. Browser downloads JavaScript
3. JavaScript runs and fetches data
4. UI finally appears

= user sees loading spinner for several seconds
```

With Server Components, **data is fetched on the server BEFORE the page is sent**:

```
1. Server fetches data
2. Server renders HTML with data already in it
3. Browser shows the populated page immediately

= user sees real content on first paint
```

This is faster, more SEO-friendly, and keeps secrets/DB credentials safely on the server.

---

## 📖 Start From Zero

### The Async Server Component

```tsx
// app/lessons/page.tsx
import { db } from "@/lib/db";

export default async function LessonsPage() {
  const lessons = await db.lesson.findMany();

  return (
    <ul>
      {lessons.map(lesson => (
        <li key={lesson.id}>{lesson.title}</li>
      ))}
    </ul>
  );
}
```

Two changes from regular React:
1. The component function is **`async`**
2. You can **`await`** directly inside the component

That's it. The framework handles the rest.

---

## 🔨 Level Up

### Step 1: Direct DB Access in Server Components

```tsx
// app/lessons/[slug]/page.tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = await db.lesson.findUnique({ where: { slug } });

  if (!lesson) notFound();

  return (
    <article>
      <h1>{lesson.title}</h1>
      <p>{lesson.objective}</p>
    </article>
  );
}
```

> **Note:** In modern Next.js (15+), `params` is a Promise — you must `await` it.

`notFound()` redirects to the nearest `not-found.tsx`. Use it whenever a record is missing.

---

### Step 2: Server Queries — Organise Reusable Logic

Rather than putting Prisma calls in every page, extract to `server/queries/`:

```typescript
// server/queries/lessons.ts
import { db } from "@/lib/db";

export async function getLessonBySlug(slug: string) {
  return db.lesson.findUnique({
    where: { slug },
    include: { module: true, notes: true }
  });
}

export async function getCompletedLessons(userId: string) {
  return db.progress.findMany({
    where: { userId, status: "completed" },
    include: { lesson: true }
  });
}
```

Then in pages:
```tsx
import { getLessonBySlug } from "@/server/queries/lessons";

export default async function Page({ params }) {
  const lesson = await getLessonBySlug((await params).slug);
  // ...
}
```

This pattern keeps your pages focused on layout and your data access reusable + testable.

---

### Step 3: Streaming with Suspense

Slow queries shouldn't block the whole page:

```tsx
import { Suspense } from "react";

export default async function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Loaded immediately</p>

      <Suspense fallback={<div>Loading stats…</div>}>
        <StatsCard />
      </Suspense>

      <Suspense fallback={<div>Loading lessons…</div>}>
        <RecentLessons />
      </Suspense>
    </div>
  );
}

async function StatsCard() {
  const stats = await getStats();   // slow query
  return <div>XP: {stats.xp}</div>;
}
```

The header renders immediately. Each slow child streams in when ready.

---

### Step 4: loading.tsx — Route-Level Loading

```tsx
// app/lessons/loading.tsx
export default function Loading() {
  return <LessonSkeleton />;
}
```

Next.js auto-wraps your page in `<Suspense fallback={Loading}>`. When you navigate to `/lessons`, the skeleton shows until the page is ready.

---

### Step 5: Parallel Data Fetching

Sequential is slow:
```tsx
const user = await getUser(id);
const lessons = await getLessons(id);     // waits for getUser to finish
const stats = await getStats(id);          // waits for getLessons
```

Parallel is faster — start all requests at once:
```tsx
const [user, lessons, stats] = await Promise.all([
  getUser(id),
  getLessons(id),
  getStats(id)
]);
```

Each query runs concurrently. Total time = slowest one, not sum.

---

### Step 6: Component-Level Fetching

You can fetch data inside any Server Component — not just pages:

```tsx
// app/dashboard/page.tsx
export default function Dashboard() {
  return (
    <div>
      <UserHeader />     {/* fetches user */}
      <StatsCard />       {/* fetches stats */}
      <LessonList />      {/* fetches lessons */}
    </div>
  );
}

async function UserHeader() {
  const user = await getCurrentUser();
  return <h1>Welcome, {user.name}</h1>;
}

async function StatsCard() {
  const stats = await getStats();
  return <div>XP: {stats.xp}</div>;
}
```

Next.js automatically parallelises these (they start at the same time).

---

### Step 7: Error Handling

```tsx
// app/lessons/error.tsx
"use client";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Couldn't load lessons</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

If any Server Component throws, this `error.tsx` shows automatically (acts as an Error Boundary).

---

### Step 8: Fetching External APIs

```tsx
export default async function GitHubProfile({ username }: { username: string }) {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    next: { revalidate: 3600 }   // cache for 1 hour
  });
  const user = await res.json();
  return <div>{user.name} has {user.public_repos} repos</div>;
}
```

`next: { revalidate }` tells Next.js to cache the response for N seconds. Powerful for slow third-party APIs.

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Basic Server Component:**
```tsx
// app/users/page.tsx — fetch a list of users from your DB, render names
```

**Exercise 2 — Dynamic params:**
```tsx
// app/users/[id]/page.tsx — fetch one user by id, show 404 if not found
```

**Exercise 3 — Query file:**
```tsx
// Move the DB queries above into server/queries/users.ts
// Import them in the pages
```

**Exercise 4 — Parallel fetch:**
```tsx
// In one page, fetch user + posts + comments using Promise.all
```

**Exercise 5 — Suspense streaming:**
```tsx
// Wrap a slow data fetch in <Suspense fallback={<Skeleton />}>
// Add an artificial delay to test
```

**Exercise 6 — loading.tsx:**
```tsx
// Add app/lessons/loading.tsx — Visit /lessons and observe the skeleton
```

**Exercise 7 — External API:**
```tsx
// Fetch from JSONPlaceholder users API
// Cache for 60 seconds with next: { revalidate: 60 }
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Awaiting `params` is required | TypeError if forgot | `const { slug } = await params;` |
| Sequential awaits | Slow | Use `Promise.all` for independent queries |
| Putting DB in Client Component | Build error | Move to Server Component or API route |
| Missing `notFound()` | Page renders with NULL data | Always check + call `notFound()` |
| Forgetting `loading.tsx` | Blank screen | Add one for any slow page |

---

## 🧠 Mental Model

```
Server Component (default):
  async function ... {
    const data = await db.query(...);  ← runs on server
    return <Component data={data} />;   ← HTML to browser
  }

Patterns:
  Promise.all([...])           parallel
  Suspense + skeleton          streaming
  notFound() / error.tsx       safety
  next: { revalidate: N }      cache external APIs
```

---

## 📝 Check Your Understanding

1. **Define:** Why is fetching data on the server faster (and safer) than client-side fetching?
2. **Predict:** What happens here?
   ```tsx
   export default async function Page() {
     const a = await fetchA();
     const b = await fetchB();   // waits for a
     // total time = a + b
   }
   ```
   How would you make it parallel?
3. **Find the bug:**
   ```tsx
   export default async function Page({ params }) {
     const lesson = await db.lesson.findUnique({ where: { slug: params.slug } });
   }
   ```
   What's missing in Next.js 15+?
4. **Write it:** A page that fetches a user, their lessons, AND their stats — all in parallel.
5. **Apply it:** Wrap a slow query in Suspense and show a custom skeleton.
6. **Reflect:** Why does Next.js push you towards Server Components for data?
