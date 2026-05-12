# Next.js: Learn Next.js Official Course

## Why This Matters

Next.js is the most popular React framework. It handles routing, rendering, data fetching, and deployment — all the hard parts of building a web app. The official "Learn Next.js" course is the definitive starting point, written by the people who built the framework.

## Core Concepts

### App Router vs Pages Router

Next.js has two routing systems. **App Router** (the one we use) is the modern approach:

- Files inside `app/` become routes automatically
- `page.tsx` renders the UI
- `layout.tsx` wraps pages with shared UI
- Server Components by default, Client Components opt-in

### Your First Route

```
app/
  page.tsx          → /
  about/
    page.tsx        → /about
  dashboard/
    page.tsx        → /dashboard
    settings/
      page.tsx      → /dashboard/settings
```

```tsx
// app/page.tsx
export default function HomePage() {
  return <h1>Welcome to Learning OS</h1>;
}
```

### Layouts — Shared UI Across Pages

```tsx
// app/layout.tsx — wraps EVERY page
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>Navigation bar</nav>
        <main>{children}</main>
      </body>
    </html>
  );
}

// app/dashboard/layout.tsx — wraps only dashboard pages
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard">
      <Sidebar />
      <div>{children}</div>
    </div>
  );
}
```

### Linking Between Pages

```tsx
import Link from "next/link";

<Link href="/dashboard">Go to Dashboard</Link>
<Link href={`/lessons/${lesson.slug}`}>View Lesson</Link>
```

Use `<Link>` instead of `<a>` — it prefetches pages for instant navigation.

### Server vs Client Components

```tsx
// Server Component (default) — runs on the server
// Can be async, can access DB directly, no JS sent to browser
export default async function LessonList() {
  const lessons = await db.lesson.findMany();
  return <ul>{lessons.map(l => <li key={l.id}>{l.title}</li>)}</ul>;
}

// Client Component — for interactivity
"use client";
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Rule**: Start with Server Components. Only add `"use client"` when you need state, effects, or browser APIs.

### Static vs Dynamic Rendering

- **Static**: Pre-rendered at build time. Fast, cached. Good for content that doesn't change often.
- **Dynamic**: Rendered on each request. Good for personalized content or frequently updated data.

```tsx
// Dynamic — automatically when using cookies, headers, or searchParams
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies(); // makes this route dynamic
  // ...
}
```

## Try It Yourself

Follow chapters 1-3 of the official course:
1. Create a new Next.js project with `create-next-app`
2. Build a home page with a welcome message
3. Add a layout with navigation
4. Create two additional pages and link between them
5. Add a Client Component with a counter

## Key Next.js Concepts Summary

| Concept | What it does |
|---|---|
| App Router | File-based routing via `app/` directory |
| Layouts | Shared UI that persists across page navigation |
| Server Components | Default — run on server, direct DB access |
| Client Components | Opt-in with `"use client"` — for interactivity |
| Link | Client-side navigation with prefetching |
| Server Actions | `"use server"` functions for mutations |

## Checkpoint

1. What is the difference between a Server Component and a Client Component?
2. How does the App Router map files to URLs?
3. What does `<Link>` do that `<a>` doesn't?
4. **Reflection**: Sketch the route structure for your Learning OS dashboard.
