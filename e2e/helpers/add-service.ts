import { expect, type Page } from "@playwright/test";

export type ServiceSlug =
  | "online-store"
  | "social-media"
  | "google-business"
  | "ads";

const SERVICE_LABELS: Record<ServiceSlug, string> = {
  "online-store": "Онлайн Магазин",
  "social-media": "Социални мрежи",
  "google-business": "Google Business",
  ads: "Реклами",
};

export function getServiceLabel(slug: ServiceSlug): string {
  return SERVICE_LABELS[slug];
}

/** Add a service via its detail page and wait until the cart page reflects the new item. */
export async function addServiceFromPage(
  page: Page,
  slug: ServiceSlug,
  expectedItemCount?: number,
) {
  await page.goto(`/services/${slug}`, { waitUntil: "networkidle" });

  const addButton = page
    .locator("#buy-now")
    .getByRole("button", { name: "Добави в кошницата" });
  await expect(addButton).toBeVisible({ timeout: 30_000 });
  await addButton.click({ timeout: 30_000 });

  await page.waitForURL("**/cart", { timeout: 30_000 });

  if (expectedItemCount !== undefined) {
    await expectCartItemCount(page, expectedItemCount);
  }
}

export async function expectCartItemCount(page: Page, count: number) {
  const label = count === 1 ? "1 услуга" : `${count} услуги`;
  await expect(page.getByText(label, { exact: false })).toBeVisible();
}

export async function expectCartContainsService(page: Page, slug: ServiceSlug) {
  const cartItem = page.locator("[data-cart-item]").filter({
    has: page.getByRole("heading", { name: getServiceLabel(slug) }),
  });
  await expect(cartItem).toBeVisible();
}

/** From cart, open an additional-service upsell link and add that service. */
export async function addServiceFromCartUpsell(page: Page, slug: ServiceSlug) {
  const promptPatterns: Record<ServiceSlug, RegExp> = {
    "online-store": /онлайн магазин/i,
    "social-media": /още повече клиенти/i,
    "google-business": /локално/i,
    ads: /реклам/i,
  };

  const link = page.getByRole("link", { name: promptPatterns[slug] });
  await expect(link).toBeVisible();
  await link.click();

  await page.waitForURL(`**/services/${slug}**`);

  const addButton = page
    .locator("#buy-now")
    .getByRole("button", { name: "Добави в кошницата" });
  await expect(addButton).toBeVisible({ timeout: 30_000 });
  await addButton.click({ timeout: 30_000 });

  await page.waitForURL("**/cart", { timeout: 30_000 });
}
