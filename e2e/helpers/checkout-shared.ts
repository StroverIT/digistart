import { expect, type Page } from "@playwright/test";

export async function proceedToCheckoutFromCart(page: Page) {
  const checkoutCta = page
    .locator("[data-cart-summary]")
    .getByRole("link", { name: /Продължи към поръчка/i });
  await expect(checkoutCta).toBeVisible({ timeout: 30_000 });
  await Promise.all([
    page.waitForURL(/\/checkout(?:\?|$)/, {
      timeout: 60_000,
      waitUntil: "domcontentloaded",
    }),
    checkoutCta.click(),
  ]);
}

export async function acceptCheckoutTerms(page: Page) {
  const termsLabel = page.getByText("Съгласен/на съм", { exact: false }).first();
  await expect(termsLabel).toBeVisible();
  await termsLabel.click();
}

export async function assertCheckoutSuccess(page: Page) {
  await expect(page).toHaveURL(/\/checkout\/success/, { timeout: 30_000 });
  await expect(page.getByText("Поръчката е успешна!")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Потвърдено")).toBeVisible({ timeout: 60_000 });
}
