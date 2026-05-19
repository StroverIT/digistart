import { expect, type Page } from "@playwright/test";
import { buildE2eCheckoutEmail } from "@/lib/server/email-test";
import {
  acceptCheckoutTerms,
  proceedToCheckoutFromCart,
  assertCheckoutSuccess,
} from "./checkout-shared";
import { completeStripeEmbeddedCheckout } from "./stripe-embedded";

export type GuestCheckoutDetails = {
  scenario: string;
  name?: string;
  phone?: string;
  password?: string;
};

const DEFAULT_NAME = "E2E Тест Клиент";
const DEFAULT_PHONE = "+359888123456";
const DEFAULT_PASSWORD = "TestPass1!";

export function buildGuestEmail(scenario: string): string {
  return buildE2eCheckoutEmail(scenario);
}

export { proceedToCheckoutFromCart, assertCheckoutSuccess };

export async function checkoutGuest(page: Page, details: GuestCheckoutDetails) {
  const email = buildGuestEmail(details.scenario);
  const name = details.name ?? DEFAULT_NAME;
  const phone = details.phone ?? DEFAULT_PHONE;
  const password = details.password ?? DEFAULT_PASSWORD;

  await expect(page.getByText(/Стъпка 1 от/)).toBeVisible();

  await page.locator("#name").fill(name);
  await page.locator("#email").fill(email);
  await page.locator("#phone").fill(phone);
  await page.locator("#password").fill(password);
  await page.locator("#passwordConfirm").fill(password);

  await acceptCheckoutTerms(page);

  await page.getByRole("button", { name: "Напред", exact: true }).click();
  await expect(page.getByText(/Стъпка 2 от/)).toBeVisible();

  const logoDesign = page.getByLabel("Искам изработка на лого (+50 €)");
  await expect(logoDesign).toBeVisible();
  await logoDesign.click();

  await page.getByRole("button", { name: "Напред към плащане" }).click();
  await expect(page.getByText(/Стъпка 3 от 3/)).toBeVisible({
    timeout: 60_000,
  });

  await completeStripeEmbeddedCheckout(page, { paymentStep: 3, totalSteps: 3 });
}
