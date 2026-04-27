import Stripe from "stripe";

/**
 * Must match a dahlia-line API version that supports embedded Checkout
 * (`ui_mode: embedded_page`). Pinned to the version bundled with stripe-node@22
 * (see `node_modules/stripe/esm/apiVersion.js`).
 */
const API_VERSION = "2026-04-22.dahlia" as const;

let stripeClient: Stripe | null = null;

export function getStripeServerClient() {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
  }

  stripeClient = new Stripe(secretKey, { apiVersion: API_VERSION });
  return stripeClient;
}
