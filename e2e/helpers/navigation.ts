import { expect, type Page } from "@playwright/test";

export async function openMainMenu(page: Page) {
  await page.getByLabel("Отвори менюто").click();
  await expect(page.getByRole("dialog", { name: "Главно меню" })).toBeVisible();
}

export async function closeMainMenu(page: Page) {
  await page.getByLabel("Затвори менюто").click();
  await expect(page.getByRole("dialog", { name: "Главно меню" })).toBeHidden();
}

export async function navigateViaMenu(page: Page, linkName: string) {
  await openMainMenu(page);
  await page.getByRole("dialog", { name: "Главно меню" }).getByRole("link", { name: linkName }).click();
}
