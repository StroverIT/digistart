import { expect, type Page } from "@playwright/test";

export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL?.trim() ?? "admin@digistart.bg";
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() ?? "admin123";
}

export async function signInAsAdmin(page: Page, destination = "/admin") {
  await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  await page.locator("#email").fill(getAdminEmail());
  await page.locator("#password").fill(getAdminPassword());
  await page.getByRole("button", { name: "Вход" }).click();

  const escaped = destination.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  await page.waitForURL(new RegExp(`${escaped}(?:\\?.*)?$`), {
    timeout: 60_000,
    waitUntil: "domcontentloaded",
  });
}

export async function signOutFromAdmin(page: Page) {
  await page.getByRole("button", { name: "Изход" }).click();
  await page.waitForURL("**/admin/login**", { timeout: 30_000 });
}

export async function expectAdminDashboardLoaded(page: Page) {
  await expect(page.getByRole("heading", { name: "Табло", level: 1 })).toBeVisible({
    timeout: 60_000,
  });
  await expect(page.getByText("Въпросник посетители")).toBeVisible({ timeout: 60_000 });
}

export async function expectUnauthenticatedAdminRedirect(page: Page) {
  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  await page.waitForURL("**/admin/login**", { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: /Администраторски панел/i })).toBeVisible();
}
