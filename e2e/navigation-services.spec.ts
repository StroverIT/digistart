import { expect, type Page } from "@playwright/test";
import { test } from "./fixtures";
import {
  addServiceFromPage,
  expectCartContainsService,
  type ServiceSlug,
} from "./helpers/add-service";
import { navigateViaMenu } from "./helpers/navigation";

const CYRILLIC_REWRITES: { path: string; serviceSlug: ServiceSlug }[] = [
  { path: "/услуги/ai-automation", serviceSlug: "ai-automation" },
  { path: "/услуги/онлайн-магазин", serviceSlug: "online-store" },
  { path: "/услуги/социални-мрежи", serviceSlug: "social-media" },
  { path: "/услуги/реклами", serviceSlug: "ads" },
  { path: "/услуги/google-business", serviceSlug: "google-business" },
];

const CORE_PAGES: { menuLabel?: string; path: string; heading: RegExp | string }[] = [
  { menuLabel: "За нас", path: "/about", heading: /Кои сме/i },
  { menuLabel: "Блог", path: "/blog", heading: /растеж/i },
  { menuLabel: "Шаблони", path: "/templates", heading: /Шаблони за/i },
  { path: "/consultation", heading: "Безплатна консултация" },
];

async function expectServiceBuySection(page: Page, buttonLabel = "Купи сега") {
  await expect(
    page.locator("#buy-now").getByRole("button", { name: buttonLabel }),
  ).toBeVisible({ timeout: 30_000 });
}

test.describe("Navigation and services", () => {
  test.describe("Cyrillic URL rewrites", () => {
    for (const { path, serviceSlug } of CYRILLIC_REWRITES) {
      test(`rewrite ${path} → /services/${serviceSlug}`, async ({ page }) => {
        await page.goto(path, { waitUntil: "domcontentloaded" });
        await expect(page).toHaveURL(new RegExp(`/services/${serviceSlug}`));
        await expectServiceBuySection(page);
      });
    }
  });

  test.describe("Core pages", () => {
    for (const { menuLabel, path, heading } of CORE_PAGES) {
      test(`loads ${path}`, async ({ page }) => {
        if (menuLabel) {
          await page.goto("/", { waitUntil: "domcontentloaded" });
          await navigateViaMenu(page, menuLabel);
        } else {
          await page.goto(path, { waitUntil: "domcontentloaded" });
        }
        await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible({
          timeout: 30_000,
        });
      });
    }
  });

  test.describe("Add to cart", () => {
    const services: ServiceSlug[] = [
      "ai-automation",
      "online-store",
      "social-media",
      "google-business",
      "ads",
    ];

    for (const slug of services) {
      test(`adds ${slug} from service page`, async ({ page }) => {
        await addServiceFromPage(page, slug, 1);
        await expectCartContainsService(page, slug);
      });
    }
  });
});
