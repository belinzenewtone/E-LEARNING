# Playwright: End-to-End Testing

## Why This Matters

Manual testing doesn't scale. Every time you change code, you risk breaking something that used to work. Playwright automates a real browser — it clicks buttons, fills forms, and checks results. Write tests once, run them on every change, and ship with confidence.

## Core Concepts

### Setup and First Test

```bash
npm install -D @playwright/test
npx playwright install
```

```typescript
// tests/dashboard.spec.ts
import { test, expect } from "@playwright/test";

test("dashboard shows welcome message", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});
```

### Key APIs

```typescript
// Navigation
await page.goto("/login");
await page.goBack();

// Locators (preferred order)
await page.getByRole("button", { name: "Submit" });
await page.getByLabel("Email");
await page.getByPlaceholder("Enter your email");
await page.getByText("Welcome back");
await page.getByTestId("submit-button");     // data-testid attribute
await page.locator("input[name='email']");   // CSS selector (last resort)

// Interactions
await page.click("button");
await page.fill("input[name='email']", "user@test.com");
await page.selectOption("select", "beginner");
await page.check("input[type='checkbox']");

// Assertions
await expect(page).toHaveURL("/dashboard");
await expect(page.getByText("Lesson saved")).toBeVisible();
await expect(page.locator(".error")).toHaveCount(0);
await expect(page.getByRole("button")).toBeDisabled();
```

### Testing an Auth Flow

```typescript
test("user can log in and see dashboard", async ({ page }) => {
  // Navigate to login
  await page.goto("/login");

  // Fill form
  await page.fill("input[name='email']", "user@test.com");
  await page.fill("input[name='password']", "password123");

  // Submit
  await page.click("button[type='submit']");

  // Verify redirect and content
  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByText("Personal Learning OS")).toBeVisible();
});
```

### Test Structure

```typescript
import { test, expect } from "@playwright/test";

test.describe("Lesson Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    // Log in before each test
  });

  test("displays lesson content", async ({ page }) => {
    await page.goto("/lessons/js-variables");
    await expect(page.getByText("Variables: var, let, const")).toBeVisible();
  });

  test("checkpoint questions are interactive", async ({ page }) => {
    await page.goto("/lessons/js-variables");
    await page.click("text=let");
    await expect(page.getByText("Correct")).toBeVisible();
  });

  test("handles non-existent lesson gracefully", async ({ page }) => {
    await page.goto("/lessons/nonexistent");
    await expect(page.getByText("not found")).toBeVisible();
  });
});
```

### Config

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: 1,
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: true,
  },
});
```

## Try It Yourself

1. Write a test that logs in and checks the dashboard loads.
2. Test that submitting an empty form shows validation errors.
3. Write a test for a dynamic route (like `/lessons/[slug]`).
4. Add `data-testid` attributes to a component and test it.

## Common Mistakes

- **Testing implementation details**: Test what the user sees and does, not internal state. Use role-based locators, not CSS classes.
- **Brittle selectors**: `.btn-primary-large` changes when CSS does. Use `getByRole("button", { name: "Submit" })` instead.
- **No test isolation**: Tests should not depend on state from other tests. Use `beforeEach` to reset.

## Checkpoint

1. What is the advantage of Playwright over manual testing?
2. What's the preferred locator strategy order?
3. How do you handle authentication in tests?
4. **Reflection**: Write a test for your most critical user flow.
