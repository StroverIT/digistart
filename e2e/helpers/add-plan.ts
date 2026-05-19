import { expect, type Page } from "@playwright/test";

export type PlanName = "Digi" | "Digistart" | "Digistart Premium";

/** Select a subscription plan on /plans and wait for redirect to cart. */
export async function addPlanFromPlansPage(page: Page, planName: PlanName = "Digi") {
  await page.goto("/plans");
  await expect(page.getByRole("heading", { level: 2, name: "Абонаментни пакети" })).toBeVisible();

  const planCard = page.locator("[data-slot='card']").filter({
    has: page.getByText(planName, { exact: true }),
  });

  const selectButton = planCard.getByRole("button", { name: "Избери план" }).first();
  await expect(selectButton).toBeVisible();
  await selectButton.click();

  await page.waitForURL("**/cart", { timeout: 30_000 });
}

export async function expectPlanInCart(page: Page, planName: PlanName) {
  const cartItem = page.locator("[data-cart-item]").filter({
    has: page.getByRole("heading", { name: `Пакет ${planName}` }),
  });
  await expect(cartItem).toBeVisible();
}
