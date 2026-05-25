import { test, expect } from "./fixtures";
import {
  expectAdminDashboardLoaded,
  expectUnauthenticatedAdminRedirect,
  getAdminEmail,
  signInAsAdmin,
  signOutFromAdmin,
} from "./helpers/admin";

const ADMIN_NAV: { label: string; heading: string | RegExp }[] = [
  { label: "Табло", heading: "Табло" },
  { label: "Поръчки", heading: "Поръчки" },
  { label: "Абонаменти", heading: /Recurring subscriptions/i },
  { label: "Консултации", heading: "Консултации" },
  { label: "Чат за помощ", heading: "Чат за помощ" },
  { label: "Бюлетин", heading: "Бюлетин" },
  { label: "Бизнеси", heading: "Бизнеси" },
  { label: "Проекти", heading: "Проекти" },
];

test.describe("Admin smoke", () => {
  test("unauthenticated /admin redirects to login", async ({ page }) => {
    await expectUnauthenticatedAdminRedirect(page);
  });

  test("login rejects invalid credentials", async ({ page }) => {
    await page.goto("/admin/login");
    await page.locator("#email").fill("wrong@example.com");
    await page.locator("#password").fill("wrong-password");
    await page.getByRole("button", { name: "Вход" }).click();
    await expect(page.getByText("Грешен имейл или парола")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("login, dashboard load, sidebar navigation, and logout", async ({ page }) => {
    await signInAsAdmin(page);
    await expectAdminDashboardLoaded(page);
    await expect(page.getByText(getAdminEmail())).toBeVisible();

    for (const { label, heading } of ADMIN_NAV.slice(1)) {
      await page.getByRole("link", { name: label }).click();
      await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible({
        timeout: 60_000,
      });
    }

    await signOutFromAdmin(page);
    await expect(page.getByRole("heading", { name: /Администраторски панел/i })).toBeVisible();
  });
});
