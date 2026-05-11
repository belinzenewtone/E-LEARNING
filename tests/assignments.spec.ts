import { test, expect } from "@playwright/test";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(process.env.ADMIN_EMAIL ?? "belinze.newtone@jtl.co.ke");
  await page.getByLabel(/password/i).fill(process.env.ADMIN_PASSWORD ?? "changeme123");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

test.describe("Assignments", () => {
  test("assignments page loads", async ({ page }) => {
    await login(page);
    await page.goto("/assignments");
    await expect(page.getByRole("heading", { name: /assignments/i })).toBeVisible();
  });

  test("shows week 1 assignment", async ({ page }) => {
    await login(page);
    await page.goto("/assignments");
    await expect(page.getByText(/Week 1/i)).toBeVisible();
  });

  test("portfolio page loads", async ({ page }) => {
    await login(page);
    await page.goto("/portfolio");
    await expect(page.getByRole("heading", { name: /portfolio/i })).toBeVisible();
  });

  test("analytics page loads", async ({ page }) => {
    await login(page);
    await page.goto("/analytics");
    await expect(page.getByRole("heading", { name: /analytics/i })).toBeVisible();
  });

  test("notes page loads", async ({ page }) => {
    await login(page);
    await page.goto("/notes");
    await expect(page.getByRole("heading", { name: /notes/i })).toBeVisible();
  });
});
