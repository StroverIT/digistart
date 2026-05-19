import { test as base } from "@playwright/test";
import { resetBrowserState } from "./helpers/storage";

export const test = base.extend({
  page: async ({ page }, use) => {
    await resetBrowserState(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await use(page);
  },
});

export { expect } from "@playwright/test";
