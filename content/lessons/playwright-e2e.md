# Playwright: End-to-End Testing

## 🎯 By End of This Lesson You Will:
- Write browser tests that simulate real user behavior
- Test login, navigation, form submission, and dynamic content
- Use locators, assertions, and test fixtures
- Run tests in CI and debug failures

## 🌍 Real-World Analogy First

Manual testing is like proofreading your own essay — you miss things. Playwright is like hiring a robot that reads every word, clicks every button, fills every form, and takes screenshots when something breaks. It does in 30 seconds what takes you 30 minutes, and it never gets tired.

## 📖 Start From Zero

```bash
npm install -D @playwright/test
npx playwright install
```

```typescript
import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
});
```

```bash
npx playwright test
```

## 🔨 Level Up

### Testing Auth Flow

```typescript
test("user can log in and see dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.fill("input[name='email']", "admin@test.com");
  await page.fill("input[name='password']", "password123");
  await page.click("button[type='submit']");
  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByText("Good morning")).toBeVisible();
});
```

### Locator Strategy (Priority Order)

```typescript
// 1. Role-based (best — accessible, resilient)
page.getByRole("button", { name: "Submit" })

// 2. Label-based
page.getByLabel("Email address")

// 3. Text content
page.getByText("Welcome back")

// 4. Test ID (for dynamic content)
page.getByTestId("submit-button")

// 5. CSS selector (last resort)
page.locator("[data-action='delete']")
```

### Fixtures for Reusable Setup

```typescript
import { test as base, expect } from "@playwright/test";

const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.goto("/login");
    await page.fill("input[name='email']", "admin@test.com");
    await page.fill("input[name='password']", "password123");
    await page.click("button[type='submit']");
    await expect(page).toHaveURL("/dashboard");
    await use(page);
  },
});

test("dashboard shows stats", async ({ authenticatedPage: page }) => {
  await expect(page.getByText("Total XP")).toBeVisible();
});
```

## 🧪 Practice — Try Each Step

1. Write a test that checks the login page loads.
2. Test a full login flow — fill credentials, submit, verify redirect.
3. Test that an empty form shows validation errors.
4. Navigate to a detail page and verify content is visible.
5. Write a test that creates an item and verifies it appears in a list.
6. Add a `data-testid` attribute to a component and test it.
7. Run `npx playwright test --ui` for visual debugging.

## ⚠️ Common Mistakes — Catch These Early

| Mistake | What You See | The Fix |
|---|---|---|
| Testing class names | Test breaks on CSS refactor | Use role, label, or text locators |
| No `await` before `expect` | False positives (assertion runs before DOM update) | Always `await expect(...)` |
| Hardcoded test data | Test passes once, fails when data changes | Use fixtures or seed test data before each test |
| Tests depend on order | Flaky results | Each test should be isolated with `beforeEach` |

## 🧠 Mental Model — One Sentence

Playwright opens a real browser, performs actions exactly like a user (click, type, navigate), and checks results — each test is a script of "do this, then verify that."

## 📝 Check Your Understanding

- **Define**: Why is `getByRole("button")` better than `locator(".btn-primary")`?
- **Predict**: What happens if a test navigates to a page that doesn't exist?
- **Find the bug**: `expect(page.getByText("Loading...")).toBeVisible()` — no `await`.
- **Write it**: Write 3 tests for a CRUD feature.
- **Apply it**: Add a retry config so flaky tests rerun once.
- **Reflect**: What's the advantage of Playwright over manual testing?

## 🚀 What This Unlocks

Ship with confidence. Tests catch regressions before users do. Every push can be verified automatically.
