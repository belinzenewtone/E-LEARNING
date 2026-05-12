# Next.js: Caching & Revalidation

## Why This Matters

Next.js caches aggressively to make your app fast. Understanding the caching layers — and knowing when to bust them — is the difference between a snappy app and one that shows outdated data. This is the most commonly confused part of Next.js; master it and you'll avoid hours of "why isn't my data updating?"

## Core Concepts

### The Four Cache Layers

| Cache | What | Where | Duration |
|---|---|---|---|
| Request Memoization | Deduplicates fetch in one render | Server | Per request |
| Data Cache | Persists fetch results | Server | Persistent (revalidate) |
| Full Route Cache | Rendered HTML/RSC payload | Server | Persistent (revalidate) |
| Router Cache | Client-side cache of pages | Browser | Session or time-based |

### revalidatePath vs revalidateTag

```typescript
// revalidatePath — clears cache for a specific route
import { revalidatePath } from "next/cache";

revalidatePath("/dashboard");       // clears /dashboard
revalidatePath("/lessons/[slug]");  // clears all dynamic lesson pages
revalidatePath("/", "layout");      // clears layout (affects all nested pages)

// revalidateTag — clears cache for tagged data
import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";

const getLessons = unstable_cache(
  async () => db.lesson.findMany(),
  ["lessons-list"],
  { tags: ["lessons"] }
);

// Later, after a mutation:
revalidateTag("lessons"); // clears only this specific cached query
```

### Time-Based Revalidation

```typescript
// Revalidate every 60 seconds
export const revalidate = 60;

export default async function Page() {
  const data = await fetch("https://api.example.com/data", {
    next: { revalidate: 60 }, // fetch-specific revalidation
  });
  // ...
}

// Or in a fetch call:
fetch("https://api.example.com/data", { next: { revalidate: 3600 } }); // 1 hour
```

### When and Why This Matters

```typescript
// Server Action: after DB write, revalidate to show new data
"use server";
export async function updateSettings(formData: FormData) {
  await db.user.update({ where: { id }, data: { name } });
  revalidatePath("/settings");  // without this, page shows old name
  revalidatePath("/dashboard"); // name appears in topbar too
}
```

### Opting Out of Caching

```typescript
// Route segment config
export const dynamic = "force-dynamic"; // never cache this route
export const revalidate = 0;            // same as force-dynamic

// Per-fetch
fetch(url, { cache: "no-store" });

// In Server Actions
import { revalidatePath } from "next/cache";
revalidatePath("/");
```

## Try It Yourself

1. Add `revalidatePath` to a Server Action that modifies data.
2. Use `export const revalidate = 10` to auto-refresh a dashboard every 10 seconds.
3. Create a tagged cache for a frequently-used query and revalidate it on mutation.
4. Observe the difference between a page with and without revalidation after a mutation.

## Common Mistakes

- **Forgetting to revalidate after mutations**: Users see stale data. Every Server Action that writes to the DB should call `revalidatePath`.
- **Revalidating too broadly**: `revalidatePath("/")` clears everything. Be specific — target only the routes that show the changed data.
- **Confusing fetch cache with route cache**: `revalidatePath` clears the route cache. `revalidateTag` clears the data cache. They serve different purposes.

## Checkpoint

1. What's the difference between `revalidatePath` and `revalidateTag`?
2. How do you make a route always fetch fresh data?
3. What happens if you forget to call `revalidatePath` after a Server Action?
4. **Reflection**: Which routes in your app need revalidation on mutation?
