# Next.js: Learn Next.js Official Course

## 🎯 By End of This Lesson You Will:
- Complete chapters 1-3 of the official Learn Next.js course
- Understand server vs client components
- Build a project locally with Next.js dev server

---

## 🌍 Real-World Analogy First

The official **Learn Next.js** course is the manufacturer's user manual. Reading it from the source — the people who built Next.js — saves you from outdated tutorials and conflicting opinions.

```
You wouldn't ignore the manual when assembling IKEA furniture.
Don't ignore the manual when learning Next.js.
```

This lesson is more of a **directed reading** — you'll spend 90 minutes inside the official course, with this lesson framing what to focus on.

---

## 📖 Start From Zero

### What is Next.js?

Next.js = a **React framework**. React gives you components; Next.js gives you everything around them:
- Routing (file-system based)
- Server Components (run on the server, send HTML to browser)
- Server Actions (mutations from the browser)
- Optimised builds (image, font, asset handling)
- Deployment that just works (especially on Vercel)

If React is the engine, Next.js is the car.

---

## 🔨 Your Tasks

### Step 1: Open the Official Course

Visit: https://nextjs.org/learn

The course has multiple sections. For this lesson, work through:
- **Chapter 1: Getting Started**
- **Chapter 2: CSS Styling**
- **Chapter 3: Optimizing Fonts and Images**

### Step 2: Set Up the Starter Project

```bash
npx create-next-app@latest learning-os-starter --typescript --tailwind --app
cd learning-os-starter
npm run dev
# Open http://localhost:3000
```

The official course gives you a starter — clone it as instructed.

### Step 3: Server Components — The Big Idea

```tsx
// Server Component — runs on the server
// app/page.tsx
import { db } from "@/lib/db";

export default async function HomePage() {
  const lessons = await db.lesson.findMany();   // direct DB query!
  return (
    <ul>
      {lessons.map(l => <li key={l.id}>{l.title}</li>)}
    </ul>
  );
}
```

This is the most important new idea: **you can run server-only code (database queries, secrets) directly inside components**. No API route needed for read operations.

### Step 4: Client Components — When You Need Interactivity

```tsx
// app/components/Counter.tsx
"use client";   // ← marks this as a Client Component

import { useState } from "react";

export function Counter() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}
```

Add `"use client"` at the top when you need:
- `useState`, `useEffect`, or any React hook
- Event handlers (onClick, onChange)
- Browser APIs

---

### Step 5: Composing Server + Client

```tsx
// Server Component fetches data
import { Counter } from "./Counter";

export default async function Page() {
  const initialCount = await getInitialCount();   // server-side
  return <Counter initial={initialCount} />;        // pass to client
}

// Client Component handles interactivity
"use client";
import { useState } from "react";

export function Counter({ initial }: { initial: number }) {
  const [n, setN] = useState(initial);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}
```

This split — server for data, client for interactivity — is the modern Next.js pattern.

---

### Step 6: Styling with Tailwind

If you used `--tailwind` in `create-next-app`, you have utility classes ready:

```tsx
<button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
  Click me
</button>
```

No CSS file needed for most cases.

---

### Step 7: Images and Fonts

Next.js optimizes these for you:

```tsx
import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Page() {
  return (
    <div className={inter.className}>
      <Image src="/hero.jpg" alt="Hero" width={800} height={400} />
    </div>
  );
}
```

The `<Image>` component auto-resizes, lazy-loads, and serves modern formats. `next/font` self-hosts Google fonts (no CDN tracking).

---

## 🧪 Practice — Try Each Step

**Exercise 1 — Set up:**
```
Create a new Next.js app via the course's recommended command
Run npm run dev and confirm you see the starter page
```

**Exercise 2 — Server Component:**
```
Create app/lessons/page.tsx as a Server Component
Have it return a hardcoded list of lesson titles
```

**Exercise 3 — Client Component:**
```
Build a Counter component with useState
Add "use client" at the top
Render it inside the Server Component above
```

**Exercise 4 — Image:**
```
Use next/image to render an image
Try a /public/image.jpg
```

**Exercise 5 — Font:**
```
Apply the Inter font from next/font/google to the entire body
```

**Exercise 6 — Style:**
```
Style a card with Tailwind: rounded, shadow, padding, hover state
```

**Exercise 7 — Reflect on the course:**
```
After completing Chapters 1-3 on nextjs.org/learn:
- What was the biggest "aha" moment?
- What part needed extra reading or video?
- What questions are you left with?
```

---

## ⚠️ Watch Out For

| Mistake | What Happens | Fix |
|---|---|---|
| Using `useState` without `"use client"` | Error | Add `"use client"` at file top |
| Importing Server Component into Client | Build error | Pass Server Component as `children` instead |
| Using secrets in Client Component | Exposed to browser | Keep DB queries / secrets in Server Components |
| Skipping `next/image` for big images | Slow page | Always use Next's Image component |
| Wrong Tailwind classes (old version) | No effect | Check Tailwind v4 docs |

---

## 🧠 Mental Model

```
Server Component (default):
  - runs on server only
  - can fetch DB / read files / use secrets
  - sends HTML (not JS) to browser

Client Component ("use client"):
  - hydrates in browser
  - can use hooks, events, browser APIs
  - no DB / secrets

Pattern: Server fetches data → passes to Client for interactivity
```

---

## 📝 Check Your Understanding

1. **Define:** What's the difference between a Server Component and a Client Component?
2. **Predict:** Does this work?
   ```tsx
   import { useState } from "react";
   export default function Page() {
     const [n, setN] = useState(0);
     return <button onClick={() => setN(n + 1)}>{n}</button>;
   }
   ```
3. **Find the bug:** Why might importing a `"use client"` component inside another `"use client"` component cause unexpected behavior?
4. **Write it:** A Server Component that fetches user info from a fake `getUser()` function, passing the result to a Client Component that toggles details visibility.
5. **Apply it:** Convert a Pages-Router-style React component to App Router.
6. **Reflect:** Why does Next.js encourage Server Components by default? What's the benefit?
