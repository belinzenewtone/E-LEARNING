# Dynamic Routes & Params

## Why This Matters

Static pages only get you so far. Dynamic routes let you create pages from data — one route template that renders any number of pages. `/lessons/[slug]` becomes `/lessons/js-variables`, `/lessons/sql-joins`, and every other lesson automatically.

## Core Concepts

### Dynamic Segments

```
app/
  lessons/
    [slug]/
      page.tsx     → /lessons/js-variables, /lessons/sql-joins, ...
  users/
    [id]/
      page.tsx     → /users/1, /users/2, ...
```

```tsx
// app/lessons/[slug]/page.tsx
export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = await db.lesson.findUnique({ where: { slug } });

  if (!lesson) {
    notFound(); // shows the nearest not-found.tsx
  }

  return <LessonContent lesson={lesson} />;
}
```

### generateStaticParams

Pre-render known pages at build time for maximum speed:

```tsx
export async function generateStaticParams() {
  const lessons = await db.lesson.findMany({ select: { slug: true } });
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

// Now /lessons/js-variables, /lessons/sql-joins, etc. are all pre-built.
// New lessons not in the list are still rendered on-demand.
```

### Catch-All Routes

```
app/
  docs/
    [...slug]/
      page.tsx     → /docs, /docs/getting-started, /docs/api/auth
```

```tsx
// app/docs/[...slug]/page.tsx
export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  // slug is ["getting-started"] or ["api", "auth"] or []
}
```

### notFound and error Boundaries

```tsx
import { notFound } from "next/navigation";

// Show 404 when resource doesn't exist
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id } });
  if (!user) notFound();
  return <UserProfile user={user} />;
}

// app/lessons/[slug]/not-found.tsx
export default function NotFound() {
  return <div>Lesson not found. Maybe try searching?</div>;
}

// app/lessons/[slug]/error.tsx — catches runtime errors
"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Metadata from Route Params

```tsx
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = await db.lesson.findUnique({ where: { slug } });

  return {
    title: lesson?.title ?? "Lesson",
    description: lesson?.objective,
  };
}
```

## Try It Yourself

1. Create a dynamic route `/products/[id]` that fetches and displays a product.
2. Add `generateStaticParams` to pre-render the top 10 products.
3. Add a `not-found.tsx` and an `error.tsx` for the route.
4. Add dynamic metadata that changes the page title based on the product name.

## Common Mistakes

- **Not awaiting params**: In Next.js 15+, `params` is a Promise. Must `await` it before accessing properties.
- **Assuming the route segment is always present**: Always handle the "not found" case — the user might type any slug.
- **Over-rendering in generateStaticParams**: Only pre-render pages that are frequently accessed. Thousands of static pages slow down builds.

## Checkpoint

1. How do you access route params in a Server Component?
2. What does `generateStaticParams` do?
3. When does `notFound()` get triggered?
4. **Reflection**: Which routes in your app should be dynamic?
