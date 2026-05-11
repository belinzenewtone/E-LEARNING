import { test, expect } from "@playwright/test";

// Shared login helper
async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(process.env.ADMIN_EMAIL ?? "belinze.newtone@jtl.co.ke");
  await page.getByLabel(/password/i).fill(process.env.ADMIN_PASSWORD ?? "changeme123");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

test.describe("Dashboard", () => {
  test("dashboard loads after login", async ({ page }) => {
    await login(page);
    await expect(page.getByText(/good/i)).toBeVisible(); // Greeting
    await expect(page.getByText(/XP/i)).toBeVisible();
  });

  test("sidebar navigation is present", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("link", { name: /roadmap/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /assignments/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /analytics/i })).toBeVisible();
  });

  test("can navigate to roadmap", async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: /roadmap/i }).click();
    await expect(page).toHaveURL(/\/roadmap/);
  });

  test("can navigate to analytics", async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: /analytics/i }).click();
    await expect(page).toHaveURL(/\/analytics/);
  });
});
