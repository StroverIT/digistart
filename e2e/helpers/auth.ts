import { expect, type Page } from "@playwright/test";
import {
  E2E_CUSTOMER_EMAIL_DEFAULT,
  getE2eCustomerEmailForTests,
} from "@/lib/server/email-test";

export { E2E_CUSTOMER_EMAIL_DEFAULT };

export function getE2eCustomerEmail(): string {
  return getE2eCustomerEmailForTests();
}

export function getE2eCustomerPassword(): string {
  const password = process.env.E2E_CUSTOMER_PASSWORD?.trim();
  if (!password) {
    throw new Error(
      "E2E_CUSTOMER_PASSWORD is required for logged-in checkout tests (set in .env.local or CI secrets).",
    );
  }
  return password;
}

export function hasE2eCustomerCredentials(): boolean {
  return Boolean(process.env.E2E_CUSTOMER_PASSWORD?.trim());
}

/** Sign in via /sign-in with the shared E2E customer account. */
export async function signInAsE2eCustomer(page: Page, callbackPath = "/cart") {
  const email = getE2eCustomerEmail();
  const password = getE2eCustomerPassword();

  await page.goto(`/sign-in?callbackUrl=${encodeURIComponent(callbackPath)}`);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Вход", exact: true }).click();

  const escaped = callbackPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  await page.waitForURL(new RegExp(`${escaped}(?:\\?.*)?$`), {
    timeout: 60_000,
    waitUntil: "domcontentloaded",
  });
}

export async function expectLoggedInOnCheckout(page: Page) {
  await expect(page.getByText(/Стъпка 1 от 2/)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByDisplayValue(getE2eCustomerEmail())).toBeVisible();
}
