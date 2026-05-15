# App Router: Layouts & Navigation

## 🎯 By End of This Lesson You Will:
- Build pages and nested layouts with the Next.js App Router
- Navigate between pages with `<Link>` and `usePathname`
- Use route groups to organize without changing URLs

---

## 🌍 Real-World Analogy First

Think of a **layout** as a **picture frame** that wraps content. Every page is a picture; the frame stays the same:

```
┌────────────────────────────────┐
│  NAV (in layout — always here) │
├────────────────────────────────┤
│                                │
│  Page content                  │   ← different per page
│  (changes as you navigate)     │
│                                │
├────────────────────────────────┤
│  FOOTER (in layout)             │
└────────────────────────────────┘
```

Without layouts you'd repeat the nav + footer in every page. Layouts let you write them ONCE and have them wrap any/all pages automatically.

---

## 📖 Start From Zero

### File-System Based Routing

```
app/
├── page.tsx           ← /
├── about/
│   └── page.tsx        ← /about
├── lessons/
│   ├── page.tsx        ← /lessons
│   └── [slug]/
│       └── page.tsx    ← /lessons/anything
```

**Rules:**
- A folder = a URL segment
- `page.tsx` = the actual page rendered at that URL
- `layout.tsx` = wraps every page in its folder + subfolders
- `[slug]` = dynamic segment

---

## 🔨 Level Up

### Step 1: The Root Layout

```tsx
// app/layout.tsx
import type { ReactNode } from "react";
import "./globals.css";

export const metadata = { title: "Learning OS" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>Site Header</header>
        {children}
        <footer>© 2026</footer>
      </body>
    </html>
  );
}
```

Every page is rendered in place of `{children}`.

### Step 2: A Page

```tsx
// app/page.tsx
export default function HomePage() {
  return <h1>Welcome to Learning OS</h1>;
}
```

Just a default-exported React component. Next.js handles the routing.

### Step 3: Nested Layout

```tsx
// app/(dashboard)/layout.tsx
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

Every page inside `(dashboard)` gets this layout. Nested layouts are composed automatically.

---

### Step 4: Route Groups — `(name)`

Folders wrapped in parens `(dashboard)` group routes WITHOUT adding to the URL:

```
app/
├── (marketing)/
│   ├── layout.tsx       ← layout for landing pages
│   ├── page.tsx          ← /  (no /marketing prefix!)
│   └── about/page.tsx    ← /about
├── (dashboard)/
│   ├── layout.tsx        ← layout for app pages
│   ├── dashboard/page.tsx
│   └── settings/page.tsx
```

The `(name)` is invisible to URLs. Use this to apply different layouts to different sections.

---

### Step 5: Link — Client-Side Navigation

```tsx
import Link from "next/link";

export default function Nav() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/lessons">Lessons</Link>
      <Link href="/dashboard">Dashboard</Link>
    </nav>
  );
}
```

`<Link>` does instant client-side navigation — no full page reload.

### Step 6: usePathname — Active Link Highlighting

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/lessons", label: "Lessons" },
  { href: "/notes", label: "Notes" }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav>
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "block px-3 py-2",
            pathname === item.href && "bg-blue-100"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

`usePathname` returns the current URL — only works in a Client Component (`"use client"`).

---

### Step 7: Loading and Error UI

Next.js auto-detects two special files:

```
app/lessons/
├── page.tsx       ← the actual page
├── loading.tsx    ← shown while page loads (Suspense fallback)
└── error.tsx      ← shown if page throws (Error Boundary)
```

```tsx
// app/lessons/loading.tsx
export default function Loading() {
  return <div>Loading lessons…</div>;
}

// app/lessons/error.tsx
"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Something broke</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Step 8: Programmatic Navigation

```tsx
"use client";
import { useRouter } from "next/navigation";

export function SubmitButton() {
  const router = useRouter();

  function onClick() {
    router.push("/success");        // navigate
    router.refresh();                // refresh data
    router.back();                    // browser back
  }

  return <button onClick={onClick}>Submit</button>;
}
```

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Create a page:**
```
Create app/about/page.tsx
Render a heading "About this app"
Visit /about
```

**Exercise 2 — Nested layout:**
```
Inside app/admin/, create layout.tsx with a sidebar
Add 2 pages: app/admin/users/page.tsx and app/admin/settings/page.tsx
Both should share the sidebar
```

**Exercise 3 — Route groups:**
```
Use (marketing) for landing pages and (dashboard) for app pages
Apply different layouts to each
```

**Exercise 4 — Link:**
```
Build a nav with 4 Links pointing to existing pages
```

**Exercise 5 — Active state:**
```
Highlight the current page in the nav using usePathname
```

**Exercise 6 — Loading state:**
```
Add a loading.tsx to a page that fetches data
Simulate slow load with: await new Promise(r => setTimeout(r, 2000))
Watch the loading UI appear
```

**Exercise 7 — Programmatic nav:**
```
After a form submit, redirect to a success page using router.push
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Using `<a href>` instead of `<Link>` | Full page reload (slow) | Use `Link` for internal nav |
| `usePathname` in Server Component | Error | Add `"use client"` |
| Forgetting `loading.tsx` | Blank screen during fetches | Add a loading file |
| Confusing route group with regular folder | Routes don't match | `(group)` = invisible, `group` = URL segment |
| Mixing Pages Router code | Doesn't work | Use App Router conventions only |

---

## 🧠 Mental Model

```
File system = your URL structure
  page.tsx     → the page rendered at this path
  layout.tsx   → wraps every nested page
  loading.tsx  → Suspense fallback
  error.tsx    → error boundary
  [slug]/      → dynamic segment
  (group)/     → no URL effect, only organizes layout

Navigation:
  <Link href="/path">       → client-side nav
  usePathname()             → current URL
  useRouter()               → programmatic push, back, refresh
```

---

## 📝 Check Your Understanding

1. **Define:** What's the difference between a route group `(name)` and a regular folder?
2. **Predict:** Given `app/(admin)/users/page.tsx`, what is the URL?
3. **Find the bug:**
   ```tsx
   import { usePathname } from "next/navigation";
   export default function Page() {
     const path = usePathname();
     // Error: usePathname only works in Client Components
   }
   ```
4. **Write it:** Build a nested layout that adds a top nav, and a deeper layout that adds a sidebar — both compose.
5. **Apply it:** Add a `loading.tsx` to any data-fetching page in your project.
6. **Reflect:** Why does Next.js base routing on the file system rather than a config file?
