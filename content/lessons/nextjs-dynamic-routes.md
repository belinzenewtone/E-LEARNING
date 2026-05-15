# Dynamic Routes & Params

## 🎯 By End of This Lesson You Will:
- Build dynamic route segments with `[param]` folders
- Read URL params and search params in Server Components
- Use catch-all segments `[...slug]` for nested URLs

---

## 🌍 Real-World Analogy First

Imagine a library:

```
Without dynamic routes:
  /book/the-great-gatsby
  /book/1984
  /book/dune
  → would need 1000 separate page.tsx files!

With dynamic routes:
  /book/[slug]
  → ONE file that handles all books
```

Dynamic segments let one file serve infinite URLs by capturing the variable part as a parameter.

---

## 📖 Start From Zero

### Your First Dynamic Route

```
app/
└── lessons/
    └── [slug]/
        └── page.tsx     ← handles /lessons/anything
```

```tsx
// app/lessons/[slug]/page.tsx
export default async function LessonPage({ 
  params 
}: { 
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  return <h1>Lesson: {slug}</h1>;
}
```

Now `/lessons/js-variables`, `/lessons/sql-joins`, `/lessons/anything-at-all` all render this page.

> **Note:** In Next.js 15+, `params` is a **Promise** — you must `await` it.

---

## 🔨 Level Up

### Step 1: Multiple Dynamic Segments

```
app/users/[userId]/posts/[postId]/page.tsx   ← /users/123/posts/456
```

```tsx
export default async function PostPage({
  params
}: {
  params: Promise<{ userId: string; postId: string }>
}) {
  const { userId, postId } = await params;
  return <p>User {userId} / Post {postId}</p>;
}
```

Both params are extracted from the URL.

---

### Step 2: Fetching by Param

```tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export default async function LessonPage({ params }) {
  const { slug } = await params;

  const lesson = await db.lesson.findUnique({ where: { slug } });
  if (!lesson) notFound();

  return <article>{lesson.content}</article>;
}
```

Always handle "not found" cases — never assume the param resolves to a real record.

---

### Step 3: Catch-All Segments — `[...slug]`

```
app/docs/[...slug]/page.tsx
```

Matches:
- `/docs/intro`
- `/docs/javascript/variables`
- `/docs/typescript/advanced/generics`

```tsx
export default async function DocsPage({
  params
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params;   // e.g. ["typescript", "advanced", "generics"]
  const path = slug.join("/");      // "typescript/advanced/generics"
  return <p>Showing docs for: {path}</p>;
}
```

### Step 4: Optional Catch-All — `[[...slug]]`

Double brackets make the param optional. Useful for routes where the base URL should also work:

```
app/docs/[[...slug]]/page.tsx
```

Matches:
- `/docs`            (slug = undefined or [])
- `/docs/intro`
- `/docs/topic/sub`

---

### Step 5: Search Params (`?key=value`)

```tsx
export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q = "", page = "1" } = await searchParams;
  // For /search?q=python&page=2 → q="python", page="2"
  return <p>Search: {q}, Page: {page}</p>;
}
```

`searchParams` is also a Promise in Next.js 15+.

---

### Step 6: Linking with Dynamic Params

```tsx
import Link from "next/link";

<Link href={`/lessons/${lesson.slug}`}>{lesson.title}</Link>
<Link href={`/users/${user.id}/posts/${post.id}`}>View</Link>
<Link href={{ pathname: "/search", query: { q: "python", page: "2" } }}>Search</Link>
```

Templates work, or pass an object with `query` for type safety.

---

### Step 7: generateStaticParams — Pre-render at Build Time

```tsx
// app/lessons/[slug]/page.tsx

export async function generateStaticParams() {
  const lessons = await db.lesson.findMany({ select: { slug: true } });
  return lessons.map(l => ({ slug: l.slug }));
}

export default async function LessonPage({ params }) {
  // ...
}
```

At build, Next.js calls `generateStaticParams` and renders one static page per result. Future requests serve the pre-built HTML instantly.

---

### Step 8: dynamicParams — Block Unknown Params

```tsx
export const dynamicParams = false;
// If a request comes for a slug not in generateStaticParams, return 404
```

vs the default `true`:
```tsx
// Generate the page on-demand for new slugs
export const dynamicParams = true;
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Basic dynamic:**
```tsx
// Create app/posts/[id]/page.tsx
// Render "Post {id}" for whatever id the user visits
```

**Exercise 2 — Fetch by param:**
```tsx
// Modify the post page to fetch the post from DB
// Call notFound() if not found
```

**Exercise 3 — Multiple params:**
```tsx
// /users/[userId]/orders/[orderId]
// Render both params
```

**Exercise 4 — Catch-all:**
```tsx
// /tags/[...slug] — render the tag path joined with /
```

**Exercise 5 — Search params:**
```tsx
// /search page that reads ?q=... and ?sort=...
// Show both values
```

**Exercise 6 — Static generation:**
```tsx
// generateStaticParams for lesson slugs
// Build with npm run build — confirm static pages generated
```

**Exercise 7 — Optional catch-all:**
```tsx
// /shop/[[...category]] that:
// - shows all products at /shop
// - shows products in /shop/electronics
// - shows products in /shop/electronics/phones
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Forgetting `await params` | TypeError accessing fields | `const { x } = await params;` |
| Not handling notFound | Crash or empty page | Always check + call `notFound()` |
| `params.slug` (without `[...]`) is a string, with `[...]` is array | TypeError | Match destructuring to bracket type |
| Mixing `[slug]` with `[...slug]` | Build error | Pick one |
| URL has special chars | Decoded wrong | Use `decodeURIComponent` if needed |

---

## 🧠 Mental Model

```
File path = URL pattern

[slug]/page.tsx       → /[slug]            (single dynamic segment)
[...slug]/page.tsx    → /a/b/c (any depth)
[[...slug]]/page.tsx  → optional catch-all

Accessing:
  params (path params): Promise<{...}>
  searchParams (?query):  Promise<{...}>
  both await-required in Next 15+

generateStaticParams + dynamicParams: pre-render specific routes at build
```

---

## 📝 Check Your Understanding

1. **Define:** What's the difference between `[slug]` and `[...slug]`?
2. **Predict:** Given file `app/[a]/[b]/page.tsx`, what URL is `/x/y/z`?
3. **Find the bug:**
   ```tsx
   export default function Page({ params }) {
     const { slug } = params;   // why might this fail?
   }
   ```
4. **Write it:** A blog where `/blog/[year]/[month]/[slug]` renders post metadata.
5. **Apply it:** Add `generateStaticParams` to a dynamic route in your project.
6. **Reflect:** Why does Next 15+ make params a Promise? What does that enable?
