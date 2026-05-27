import { test, expect } from "./fixtures";
import {
  addServiceFromCartUpsell,
  addServiceFromPage,
  expectCartContainsService,
  expectCartItemCount,
} from "./helpers/add-service";
import { addPlanFromPlansPage, expectPlanInCart } from "./helpers/add-plan";
import { hasE2eCustomerCredentials, signInAsE2eCustomer } from "./helpers/auth";
import { checkoutLoggedInCustomer } from "./helpers/checkout-logged-in";
import {
  assertCheckoutSuccess,
  checkoutGuest,
  proceedToCheckoutFromCart,
} from "./helpers/checkout-guest";

test.describe.configure({ mode: "serial", timeout: 240_000 });

test.describe("Checkout scenarios", () => {
  test("1. Само една услуга", async ({ page }) => {
    await addServiceFromPage(page, "online-store", 1);
    await expectCartContainsService(page, "online-store");

    await proceedToCheckoutFromCart(page);
    await checkoutGuest(page, { scenario: "one-service" });
    await assertCheckoutSuccess(page);
  });

  test("2. Две услуги", async ({ page }) => {
    await addServiceFromPage(page, "online-store", 1);
    await addServiceFromCartUpsell(page, "social-media");
    await expectCartItemCount(page, 2);
    await expectCartContainsService(page, "online-store");
    await expectCartContainsService(page, "social-media");

    await proceedToCheckoutFromCart(page);
    await checkoutGuest(page, { scenario: "two-services" });
    await assertCheckoutSuccess(page);
  });

  test("3. Три услуги", async ({ page }) => {
    await addServiceFromPage(page, "online-store", 1);
    await addServiceFromCartUpsell(page, "social-media");
    await expectCartItemCount(page, 2);
    await addServiceFromCartUpsell(page, "google-business");
    await expectCartItemCount(page, 3);

    await proceedToCheckoutFromCart(page);
    await checkoutGuest(page, { scenario: "three-services" });
    await assertCheckoutSuccess(page);
  });

  test("4. План", async ({ page }) => {
    await addPlanFromPlansPage(page, "Digi");
    await expectPlanInCart(page, "Digi");
    await expectCartItemCount(page, 1);

    await proceedToCheckoutFromCart(page);
    await checkoutGuest(page, { scenario: "plan-only" });
    await assertCheckoutSuccess(page);
  });

  test("5. План с услуга", async ({ page }) => {
    await addPlanFromPlansPage(page, "Digi");
    await expectPlanInCart(page, "Digi");
    await addServiceFromCartUpsell(page, "google-business");
    await expectCartItemCount(page, 2);
    await expect(
      page.getByText(/Имате абонаментен пакет и отделни услуги.*припокриват/i),
    ).toBeVisible();

    await proceedToCheckoutFromCart(page);
    await checkoutGuest(page, { scenario: "plan-plus-service" });
    await assertCheckoutSuccess(page);
  });
});

test.describe("Logged-in checkout", () => {
  test.describe.configure({ mode: "serial", timeout: 240_000 });
  test.skip(!hasE2eCustomerCredentials(), "Set E2E_CUSTOMER_PASSWORD in .env.local");

  test.beforeEach(async ({ page }) => {
    await signInAsE2eCustomer(page, "/cart");
  });

  test("6. Логнат потребител - една услуга", async ({ page }) => {
    await addServiceFromPage(page, "online-store", 1);
    await expectCartContainsService(page, "online-store");

    await proceedToCheckoutFromCart(page);
    await checkoutLoggedInCustomer(page, { scenario: "logged-in-one-service" });
    await assertCheckoutSuccess(page);
  });
});
