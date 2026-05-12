# Accessibility & Semantic HTML

## Why This Matters

15% of the world's population has a disability. Accessible websites aren't just ethically right — they're legally required in many jurisdictions and improve SEO, usability, and code quality for everyone. Semantic HTML is free accessibility; ARIA is the fallback when HTML isn't enough.

## Core Concepts

### Semantic HTML Elements

```html
<!-- Use semantic elements instead of div soup -->
<header>    → page/section header
<nav>       → navigation links
<main>      → primary content (one per page)
<section>   → thematic grouping
<article>   → self-contained content
<aside>     → sidebar / complementary content
<footer>    → page/section footer
```

```html
<!-- Before (bad) -->
<div class="header">
  <div class="nav">...</div>
</div>
<div class="content">...</div>

<!-- After (good) -->
<header>
  <nav aria-label="Main navigation">...</nav>
</header>
<main>...</main>
```

### Heading Hierarchy

```html
<!-- One h1 per page, headings must not skip levels -->
<h1>Dashboard</h1>
  <h2>Your Progress</h2>
    <h3>Web Development</h3>
    <h3>Data Engineering</h3>
  <h2>Recent Activity</h2>
```

Screen readers use headings to navigate. A broken hierarchy makes your site unnavigable.

### Keyboard Navigation

```tsx
// Interactive elements must be focusable and operable via keyboard
<button onClick={handleClick}>Click me</button>  // naturally focusable
<a href="/page">Go to page</a>                    // naturally focusable

// For custom interactive elements, use:
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(); }}
>
  Custom button
</div>

// But ideally: just use <button> — it handles all of this for free
```

### ARIA Labels

```tsx
// For elements without visible text
<button aria-label="Close dialog">
  <XIcon />
</button>

// Describing complex widgets
<div role="tablist" aria-label="Settings tabs">
  <button role="tab" aria-selected={active === "profile"}>Profile</button>
  <button role="tab" aria-selected={active === "security"}>Security</button>
</div>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {notification}  // announced by screen reader when it changes
</div>
```

### Color and Contrast

- **Minimum contrast ratio**: 4.5:1 for normal text, 3:1 for large text
- Never use color alone to convey information — add icons or text
- Test with Chrome DevTools: Lighthouse → Accessibility audit

```tsx
// Bad — color alone
<span className="text-red-500">Error</span>

// Good — color + icon + text
<span className="text-red-500 flex items-center gap-1">
  <AlertCircle className="w-4 h-4" />
  Error: Invalid email
</span>
```

### Focus Management

```tsx
// After opening a modal, move focus inside
const modalRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  modalRef.current?.focus();
}, []);

// Trap focus inside modal (simplified)
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape") close();
  // Tab trap logic
}
```

### alt Text for Images

```tsx
// Decorative images: empty alt
<img src="decorative-line.svg" alt="" />

// Informational images: descriptive alt
<img src="chart.png" alt="Study hours per week: 15 in Week 1, rising to 22 in Week 4" />
```

## Try It Yourself

1. Run a Lighthouse accessibility audit on your dashboard.
2. Replace 3 `<div>` elements with semantic HTML equivalents.
3. Add keyboard navigation to a custom interactive component.
4. Check all color combinations in your app for contrast compliance.

## Common Mistakes

- **Missing heading hierarchy**: Jumping from h1 to h3 breaks screen reader navigation.
- **div with onClick but no keyboard support**: Only `<button>` and `<a>` get keyboard events for free. Custom elements need `tabIndex` and `onKeyDown`.
- **Color-only error indicators**: Add icons and text alongside colored elements.

## Checkpoint

1. What are the most common accessibility mistakes in web apps?
2. When is an empty alt attribute appropriate?
3. How do you make a custom interactive element keyboard-accessible?
4. **Reflection**: Audit your dashboard for accessibility issues.
