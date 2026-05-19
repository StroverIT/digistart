import { expect, type Frame, type Locator, type Page } from "@playwright/test";

const CARD_NUMBER = "4242 4242 4242 4242";
const CARD_EXPIRY = "12 / 34";
const CARD_CVC = "123";
const CARDHOLDER_NAME = "E2E Тест Клиент";

/** Subscription vs one-time Stripe Embedded Checkout submit labels. */
const PAY_BUTTON_NAME =
  /Плащане и абониране|Плащане|Pay and subscribe|^Pay$/i;
const PROCESSING_LABEL = /Обработва се|Processing|Изпращане|Please wait/i;
const SUCCESS_URL_TIMEOUT_MS = 180_000;
const MAX_PAY_ATTEMPTS = 5;
const PAY_ATTEMPT_MS = 45_000;

async function dismissBlockingOverlays(page: Page) {
  const dialog = page.getByRole("dialog");
  if (await dialog.isVisible().catch(() => false)) {
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden({ timeout: 5_000 }).catch(() => undefined);
  }
}

function payButton(frame: Frame): Locator {
  return frame.getByRole("button", { name: PAY_BUTTON_NAME });
}

/** Frame that hosts Stripe Embedded Checkout (pay button + card fields). */
async function findEmbeddedCheckoutFrame(page: Page): Promise<Frame> {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    for (const frame of page.frames()) {
      if ((await payButton(frame).count()) > 0) {
        return frame;
      }
    }
    await page.waitForTimeout(300);
  }
  throw new Error("Stripe embedded checkout frame not found.");
}

async function waitForCheckoutFormReady(frame: Frame) {
  const cardNumber = frame.getByRole("textbox", { name: /Номер на картата|Card number/i });
  await expect(cardNumber).toBeVisible({ timeout: 60_000 });
  await expect(cardNumber).toBeEditable({ timeout: 30_000 });
}

async function fillStripeField(frame: Frame, name: RegExp, value: string) {
  const field = frame.getByRole("textbox", { name });
  await field.click();
  await field.fill(value);
  await field.blur();
}

async function fillCheckoutForm(frame: Frame) {
  await fillStripeField(frame, /Номер на картата|Card number/i, CARD_NUMBER);
  await fillStripeField(frame, /Срок на валидност|Expiry/i, CARD_EXPIRY);
  await fillStripeField(frame, /^CVC$/i, CARD_CVC);
  await fillStripeField(frame, /Име на картодържателя|Cardholder/i, CARDHOLDER_NAME);
}

/** Stripe enables Pay only after async card validation — wait until it stays enabled. */
async function waitForPayButtonReady(frame: Frame) {
  const button = payButton(frame);
  await expect(button).toBeVisible({ timeout: 60_000 });

  let stableEnabledChecks = 0;
  await expect
    .poll(
      async () => {
        const enabled = await button.isEnabled().catch(() => false);
        if (!enabled) {
          stableEnabledChecks = 0;
          return false;
        }
        stableEnabledChecks += 1;
        return stableEnabledChecks >= 2;
      },
      { timeout: 60_000, intervals: [250, 400, 600, 1000] },
    )
    .toBe(true);
}

async function readStripeAlert(frame: Frame): Promise<string | null> {
  const alert = frame.getByRole("alert");
  if (!(await alert.isVisible().catch(() => false))) return null;
  return (await alert.textContent())?.trim() || "Stripe validation error";
}

async function waitForCheckoutSuccess(
  frame: Frame,
  page: Page,
  button: Locator,
  timeoutMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  let sawProcessing = false;

  while (Date.now() < deadline) {
    if (page.url().includes("/checkout/success")) return true;

    if (await frame.getByText(PROCESSING_LABEL).isVisible().catch(() => false)) {
      sawProcessing = true;
    } else if (!sawProcessing && (await button.isEnabled().catch(() => false))) {
      // Pay never started (validation lag or missed click).
      return false;
    }

    const stripeError = await readStripeAlert(frame);
    if (stripeError) {
      throw new Error(`Stripe checkout error: ${stripeError}`);
    }

    await page.waitForTimeout(400);
  }

  return page.url().includes("/checkout/success");
}

async function submitPayment(frame: Frame, page: Page) {
  const button = payButton(frame);
  const overallDeadline = Date.now() + SUCCESS_URL_TIMEOUT_MS;

  for (let attempt = 1; attempt <= MAX_PAY_ATTEMPTS; attempt++) {
    if (page.url().includes("/checkout/success")) return;

    const remainingMs = overallDeadline - Date.now();
    if (remainingMs <= 0) break;

    await waitForPayButtonReady(frame);
    await button.scrollIntoViewIfNeeded();
    await button.click({ delay: 80 });

    const attemptTimeout = Math.min(PAY_ATTEMPT_MS, remainingMs);
    const completed = await waitForCheckoutSuccess(frame, page, button, attemptTimeout);
    if (completed) return;
  }

  const stripeError = await readStripeAlert(frame);
  if (stripeError) {
    throw new Error(`Stripe checkout error: ${stripeError}`);
  }

  throw new Error(
    `Stripe payment did not reach /checkout/success after ${MAX_PAY_ATTEMPTS} attempts (url: ${page.url()}).`,
  );
}

/** Complete payment in Stripe Embedded Checkout (subscription or one-time). */
export async function completeStripeEmbeddedCheckout(
  page: Page,
  options?: { paymentStep?: number; totalSteps?: number },
) {
  const totalSteps = options?.totalSteps ?? 3;
  const paymentStep = options?.paymentStep ?? totalSteps;

  await dismissBlockingOverlays(page);
  await expect(
    page.getByText(new RegExp(`Стъпка ${paymentStep} от ${totalSteps}`)),
  ).toBeVisible({ timeout: 60_000 });

  await expect(page.locator('iframe[src*="stripe"]').first()).toBeVisible({
    timeout: 60_000,
  });

  const checkoutFrame = await findEmbeddedCheckoutFrame(page);
  await waitForCheckoutFormReady(checkoutFrame);
  await fillCheckoutForm(checkoutFrame);
  await submitPayment(checkoutFrame, page);

  await expect(page).toHaveURL(/\/checkout\/success/, { timeout: 15_000 });
}
