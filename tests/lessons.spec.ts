import { test, expect } from "@playwright/test";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(process.env.ADMIN_EMAIL ?? "belinze.newtone@jtl.co.ke");
  await page.getByLabel(/password/i).fill(process.env.ADMIN_PASSWORD ?? "changeme123");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

test.describe("Lessons", () => {
  test("roadmap page shows both tracks", async ({ page }) => {
    await login(page);
    await page.goto("/roadmap");
    await expect(page.getByText(/Web Development/i)).toBeVisible();
    await expect(page.getByText(/Data Engineering/i)).toBeVisible();
  });

  test("lessons page loads", async ({ page }) => {
    await login(page);
    await page.goto("/lessons");
    await expect(page.getByRole("heading", { name: /all lessons/i })).toBeVisible();
  });

  test("can open a lesson from the lessons page", async ({ page }) => {
    await login(page);
    await page.goto("/lessons");
    // Click the first lesson link
    const firstLink = page.getByRole("link", { name: /open lesson/i }).first();
    if (await firstLink.isVisible()) {
      await firstLink.click();
      await expect(page.getByText(/objective/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test("weekly sprints page loads", async ({ page }) => {
    await login(page);
    await page.goto("/weeks");
    await expect(page.getByText(/Week 1/i)).toBeVisible();
  });
});
