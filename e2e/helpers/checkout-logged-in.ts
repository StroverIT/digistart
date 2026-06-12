import { expect, type Page } from "@playwright/test";
import { acceptCheckoutTerms } from "./checkout-shared";
import { completeStripeEmbeddedCheckout } from "./stripe-embedded";

const DEFAULT_PHONE = "+359888123456";

export type LoggedInCheckoutDetails = {
  scenario: string;
  phone?: string;
};

export async function checkoutLoggedInCustomer(
  page: Page,
  details: LoggedInCheckoutDetails,
) {
  const phone = details.phone ?? DEFAULT_PHONE;

  await expect(page.getByText(/Стъпка 1 от 2/)).toBeVisible({ timeout: 30_000 });

  const phoneField = page.locator("#phone2");
  if (await phoneField.isVisible()) {
    const current = await phoneField.inputValue();
    if (!current.trim()) {
      await phoneField.fill(phone);
    }
  }

  await acceptCheckoutTerms(page);

  await page.getByRole("button", { name: "Напред към плащане" }).click();
  await expect(page.getByText(/Стъпка 2 от 2/)).toBeVisible({ timeout: 60_000 });

  await completeStripeEmbeddedCheckout(page, { paymentStep: 2, totalSteps: 2 });
}
