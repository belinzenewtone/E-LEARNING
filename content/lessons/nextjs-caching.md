# Next.js: Caching & Revalidation

## 🎯 By End of This Lesson You Will:
- Understand the 4 caching layers Next.js uses
- Use `revalidatePath`, `revalidateTag`, and `revalidate` to control freshness
- Diagnose stale data issues

---

## 🌍 Real-World Analogy First

Caching is like **keeping printed copies of pages instead of regenerating them every time**:

```
Without cache: Every visit → server renders → slow
With cache:     First visit → server renders → save copy
                Future visits → serve saved copy → fast

But: If the data changes, you need to throw away the saved copy.
That's revalidation.
```

Next.js gives you several caches and tools to invalidate them. Getting caching right = fast pages that show fresh data.

---

## 📖 Start From Zero

### The 4 Layers of Cache in Next.js

```
1. Data Cache    — fetch() responses by URL (server-side)
2. Full Route Cache — pre-rendered pages (static pages)
3. Router Cache   — client-side cache of visited routes
4. Request Memo   — deduplicates fetch() within a single render
```

You don't need to think about all four every day, but knowing they exist explains a lot of "why is my data stale?" confusion.

---

## 🔨 Level Up

### Step 1: Static vs Dynamic Rendering

By default, Next.js statically renders pages at build time:

```tsx
// app/lessons/page.tsx
import { db } from "@/lib/db";

export default async function Lessons() {
  const lessons = await db.lesson.findMany();
  return <ul>{lessons.map(l => <li key={l.id}>{l.title}</li>)}</ul>;
}
```

If you use Prisma directly, Next.js makes this dynamic. If you use fetch() to a public URL, it'll be cached by default.

To **force dynamic rendering** (always fresh):
```tsx
export const dynamic = "force-dynamic";
```

---

### Step 2: fetch() Default Caching

When you `fetch()` in a Server Component:

```tsx
// Cached forever (until manually invalidated)
const res = await fetch("https://api.example.com/users");

// No cache — always fresh
const res = await fetch("https://api.example.com/users", { cache: "no-store" });

// Revalidate every 60 seconds
const res = await fetch("https://api.example.com/users", { next: { revalidate: 60 } });

// Tagged for selective invalidation
const res = await fetch("https://api.example.com/users", { next: { tags: ["users"] } });
```

### Step 3: revalidatePath — Bust Cache for a URL

```typescript
"use server";
import { revalidatePath } from "next/cache";

export async function createPost(data: FormData) {
  await db.post.create({ /* ... */ });
  revalidatePath("/posts");        // refresh /posts page
  revalidatePath("/", "layout");    // refresh entire layout tree
}
```

Use after mutations to keep UI fresh.

---

### Step 4: revalidateTag — Bust Cache for a Tag

```tsx
// Tag your data at fetch time:
const res = await fetch("/api/lessons", { next: { tags: ["lessons"] } });

// Bust by tag:
"use server";
import { revalidateTag } from "next/cache";

export async function createLesson(data) {
  await db.lesson.create({ /* ... */ });
  revalidateTag("lessons");   // every cached request with tag "lessons" is invalidated
}
```

Tags are flexible — one tag can be used across many fetch calls.

---

### Step 5: Time-Based Revalidation (ISR)

```tsx
// app/dashboard/page.tsx

// Refresh this page every 60 seconds
export const revalidate = 60;

export default async function Dashboard() {
  const data = await getStats();
  return <div>...</div>;
}
```

Or per-fetch:
```tsx
const data = await fetch(url, { next: { revalidate: 300 } });   // 5 minutes
```

ISR (Incremental Static Regeneration) gives you near-static performance with auto-refresh.

---

### Step 6: dynamicParams and generateStaticParams

For dynamic routes, pre-render specific values at build time:

```tsx
// app/lessons/[slug]/page.tsx

export async function generateStaticParams() {
  const lessons = await db.lesson.findMany({ select: { slug: true } });
  return lessons.map(l => ({ slug: l.slug }));
}

export const dynamicParams = false;  // 404 for anything not pre-rendered

export default async function LessonPage({ params }) {
  const { slug } = await params;
  // ...
}
```

The pre-generated pages are super fast; unknown slugs return 404.

---

### Step 7: noStore — Opt Out for One Function

```typescript
import { unstable_noStore as noStore } from "next/cache";

export async function getLiveData() {
  noStore();    // tells Next.js not to cache this call's result
  return db.someRealtimeThing.findMany();
}
```

Useful for specific functions that should always be fresh, without making the whole page dynamic.

---

### Step 8: Common Patterns

```
"This page should always be fresh"
  → export const dynamic = "force-dynamic";

"This data refreshes every N seconds"
  → fetch with next: { revalidate: N }
  → or export const revalidate = N

"Refresh after every mutation"
  → revalidatePath in the Server Action

"Different cache lifetimes for different data on same page"
  → use fetch options per call, or tags + revalidateTag
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Force dynamic:**
```tsx
// Create app/now/page.tsx that shows the current time
// Make it always fresh on every visit
```

**Exercise 2 — ISR:**
```tsx
// Add export const revalidate = 30 to a page
// Notice: it caches for 30 seconds, then refreshes on next visit
```

**Exercise 3 — Tagged fetch:**
```tsx
// fetch from JSONPlaceholder with next: { tags: ["users"] }
// In a Server Action, call revalidateTag("users") to bust
```

**Exercise 4 — revalidatePath:**
```typescript
// After your create-something action, call revalidatePath("/list-page")
// Confirm the list page now shows the new item
```

**Exercise 5 — generateStaticParams:**
```tsx
// Pre-render lesson detail pages for all your seed lessons at build time
```

**Exercise 6 — Mix caching strategies:**
```tsx
// On a dashboard, have:
//   - User profile: cached aggressively
//   - Live notification count: noStore
//   - Recent activity: revalidate every 60s
```

**Exercise 7 — Debug a stale UI:**
```
You make a change in DB but the list page still shows old data.
What 3 things would you check?
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Forgetting revalidatePath after mutation | UI shows old data | Add it in Server Action |
| Over-caching | Stale dashboards | Use shorter revalidate or no-store |
| Force-dynamic everywhere | Slow pages | Cache by default; opt out where needed |
| Caching DB queries unexpectedly | Stale results | Be explicit about cache strategy |
| Mismatched tag names | Wrong cache busted | Use constants for tag names |

---

## 🧠 Mental Model

```
Default behaviour:
  fetch with no options       → cached forever
  Prisma / DB direct          → not cached (dynamic)
  Static pages                → built once at deploy

Cache controls:
  cache: "no-store"           never cache
  next: { revalidate: N }     ISR — cache N seconds
  next: { tags: ["..."] }      tag for selective busting

Invalidate:
  revalidatePath("/url")      bust a specific URL
  revalidateTag("name")       bust everything with that tag
```

---

## 📝 Check Your Understanding

1. **Define:** What are the 4 caches in Next.js (briefly)?
2. **Predict:**
   ```tsx
   const data = await fetch(url, { next: { revalidate: 60 } });
   ```
   How fresh is `data`?
3. **Find the bug:** Your `/posts` page still shows old data after creating a post. What's missing?
4. **Write it:** A page with a 10-second ISR that refreshes a JSONPlaceholder fetch.
5. **Apply it:** Mix caching on a dashboard — some sections cached, some live.
6. **Reflect:** Why does Next.js make caching the default rather than opt-in?
