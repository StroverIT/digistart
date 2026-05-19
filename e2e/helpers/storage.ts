import type { Page } from "@playwright/test";

const CART_STORAGE_KEY = "digistart-cart";
const COOKIE_CONSENT_KEY = "digistart_cookie_consent_v1";

const CHECKOUT_STATE_KEYS = [
  "digistart-checkout-draft",
  "digistart-checkout-brand-assets",
  "digistart-checkout-consultation",
  "digistart-checkout-step",
  "digistart-checkout-template",
];

/** Reset cart, checkout drafts, and pre-accept cookies so the banner does not block clicks. */
export async function resetBrowserState(page: Page) {
  await page.addInitScript(
    ({ cartKey, consentKey, checkoutKeys }) => {
      localStorage.removeItem(cartKey);
      for (const key of checkoutKeys) {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      }
      localStorage.setItem(
        consentKey,
        JSON.stringify({
          functional: true,
          ads: false,
          updatedAt: new Date().toISOString(),
        }),
      );
    },
    {
      cartKey: CART_STORAGE_KEY,
      consentKey: COOKIE_CONSENT_KEY,
      checkoutKeys: CHECKOUT_STATE_KEYS,
    },
  );
}
