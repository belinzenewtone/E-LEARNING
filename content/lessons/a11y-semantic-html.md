# Accessibility & Semantic HTML

## 🎯 By End of This Lesson You Will:
- Write semantic HTML that screen readers understand
- Use ARIA attributes correctly
- Test keyboard navigation and color contrast
- Fix the 5 most common accessibility issues

## 🌍 Real-World Analogy First

A building without ramps locks out wheelchair users. A website without semantic HTML locks out screen reader users. Accessibility isn't an add-on — it's how you build the entrance. 15% of people have a disability. Building accessibly means you serve everyone.

## 📖 Start From Zero

### Semantic HTML — Free Accessibility

```html
<!-- ❌ Div soup — screen readers see nothing -->
<div class="header">My Site</div>
<div class="nav"><div onclick="...">Home</div></div>
<div class="content">Hello</div>

<!-- ✅ Semantic — screen readers navigate easily -->
<header><h1>My Site</h1></header>
<nav><a href="/">Home</a></nav>
<main><p>Hello</p></main>
```

### Heading Hierarchy

```html
<h1>Dashboard</h1>       <!-- One per page -->
  <h2>Your Progress</h2>  <!-- Sub-sections -->
    <h3>Web Track</h3>    <!-- Sub-sub-sections -->
    <h3>Data Track</h3>
```

Never skip levels. Screen reader users navigate by headings.

## 🔨 Level Up

### Keyboard Navigation

```tsx
// ✅ Native — free keyboard support
<button onClick={handleClick}>Submit</button>
<a href="/page">Go there</a>

// ❌ Custom — must add keyboard handling
<div onClick={handleClick}>  {/* Not focusable, no Enter/Space */}
```

### ARIA — When HTML Isn't Enough

```tsx
<button aria-label="Close dialog"><XIcon /></button>

<div role="alert" aria-live="polite">
  {notification}
</div>

<nav aria-label="Main navigation">...</nav>
```

### Color & Contrast Checklist
- Text: minimum 4.5:1 contrast ratio
- Never use color alone to convey meaning
- Test with Chrome DevTools → Lighthouse

## 🧪 Practice — Try Each Step

1. Replace 3 `<div>` elements with semantic HTML in your page.
2. Add `aria-label` to an icon-only button.
3. Tab through your entire page — can you reach every interactive element?
4. Run a Lighthouse accessibility audit and fix all issues.
5. Test with a screen reader (VoiceOver on Mac, NVDA on Windows).
6. Check that all images have meaningful `alt` text (or empty `alt=""` for decorative).

## ⚠️ Common Mistakes — Catch These Early

| Mistake | What Happens | The Fix |
|---|---|---|
| Missing heading hierarchy | Screen reader can't navigate | Use h1 → h2 → h3 sequentially |
| `div` with `onClick`, no `tabIndex` | Keyboard users can't click it | Use `<button>` instead |
| Color-only indicators | Colorblind users miss information | Add icons + text |
| Missing form labels | Screen reader can't identify fields | Every input needs a `<label>` |
| `alt="photo"` on images | Useless description | Describe what's meaningful OR use `alt=""` for decoration |

## 🧠 Mental Model — One Sentence

Semantic HTML is 80% of accessibility — use the right elements (`<button>`, `<nav>`, `<main>`) and ARIA fills the remaining gaps where HTML falls short.

## 📝 Check Your Understanding

- **Define**: What's the difference between `aria-label` and `aria-labelledby`?
- **Predict**: What happens if you focus a modal but forget to trap focus inside?
- **Find the bug**: `<img src="chart.png" alt="" />` — when is this correct?
- **Write it**: Add accessible labels to 3 interactive elements on your page.
- **Apply it**: Run Lighthouse and fix every accessibility issue.
- **Reflect**: What are the most common accessibility mistakes in web apps?

## 🚀 What This Unlocks**

Inclusive products. Accessibility improves SEO, usability for everyone, and ensures you're not excluding 1 billion people with disabilities.
