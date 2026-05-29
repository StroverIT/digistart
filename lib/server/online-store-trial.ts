import type Stripe from "stripe";
import { ONLINE_STORE_SERVICE_ID } from "@/lib/store-dns";

/** Matches marketing on `/services/online-store` (14-day free trial). */
export const ONLINE_STORE_TRIAL_DAYS = 14;

export const ONLINE_STORE_SUBSCRIPTION_OPTION_ID = "subscription";

export function cartQualifiesForOnlineStoreTrial(
  items: Array<{
    serviceId: string;
    selectedOptionId: string;
    billingCycle?: string;
  }>,
): boolean {
  return items.some(
    (item) =>
      item.serviceId === ONLINE_STORE_SERVICE_ID &&
      item.selectedOptionId === ONLINE_STORE_SUBSCRIPTION_OPTION_ID &&
      item.billingCycle !== "annual-prepaid",
  );
}

/** Checkout completed with charge, or subscription started on trial ($0 due today). */
export function isStripeCheckoutSessionFulfilled(
  session: Pick<Stripe.Checkout.Session, "payment_status" | "mode" | "subscription">,
): boolean {
  if (session.payment_status === "paid") return true;
  if (
    session.payment_status === "no_payment_required" &&
    session.mode === "subscription" &&
    session.subscription
  ) {
    return true;
  }
  return false;
}

export function stripeCheckoutPaidAt(
  session: Pick<Stripe.Checkout.Session, "payment_status">,
): Date | null {
  return session.payment_status === "paid" ? new Date() : null;
}
