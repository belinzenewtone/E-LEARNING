# App Router: Layouts & Navigation

## Why This Matters

The App Router is the foundation of your Next.js app. Layouts persist across page navigation, route groups organize pages without changing URLs, and the Link component provides instant client-side navigation. Getting these patterns right makes your app feel fast and professional.

## Core Concepts

### Nested Layouts

```
app/
  layout.tsx              ← Root layout (wraps everything)
  dashboard/
    layout.tsx            ← Dashboard layout (sidebar + topbar)
    page.tsx              ← /dashboard
    analytics/
      page.tsx            ← /dashboard/analytics
    settings/
      page.tsx            ← /dashboard/settings
  login/
    layout.tsx            ← Login layout (no sidebar, centered)
    page.tsx              ← /login
```

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
```

The sidebar stays mounted when navigating between dashboard pages — no flash, no remount.

### Route Groups

Folders in parentheses `()` don't affect the URL:

```
app/
  (dashboard)/
    dashboard/page.tsx    → /dashboard
    analytics/page.tsx    → /analytics
  (auth)/
    login/page.tsx        → /login
    register/page.tsx     → /register
```

Each group can have its own layout, while keeping flat URLs.

### Active Link Detection

```tsx
"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={isActive ? "text-primary border-l-2 border-primary" : "text-muted-foreground"}
    >
      {children}
    </Link>
  );
}
```

### Pattern: Server Data + Client Navigation

```tsx
// Server side — fetch all navigation data
export default async function DashboardLayout({ children }) {
  const modules = await db.module.findMany({ select: { title: true, slug: true } });

  return (
    <div className="flex">
      <SidebarClient modules={modules} />
      <main>{children}</main>
    </div>
  );
}

// Client side — interactive navigation
"use client";
function SidebarClient({ modules }) {
  const pathname = usePathname();
  return (/* render nav with active states */);
}
```

## Try It Yourself

1. Create a nested layout for `/dashboard/settings` that adds a settings nav.
2. Use route groups to separate authenticated and public pages.
3. Build a `NavLink` component that highlights the active route.
4. Split your sidebar into a Server Component (data) and Client Component (interactivity).

## Common Mistakes

- **Adding `"use client"` to layouts unnecessarily**: Layouts CAN be server components. Only add it if you need hooks or event handlers.
- **Nesting layout incorrectly**: Each `layout.tsx` must render `children`. Forgetting to do so hides the page content.
- **Over-fetching in layouts**: Layouts re-render on navigation. Keep layout data fetching minimal — heavy data goes in page components.

## Checkpoint

1. How do route groups help organize pages without affecting URLs?
2. What happens to a layout when you navigate between its child pages?
3. How do you detect the current active route?
4. **Reflection**: Design the layout hierarchy for your Learning OS.
