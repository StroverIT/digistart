import Stripe from "stripe";

const apiVersion: Stripe.LatestApiVersion = "2026-01-28.clover";

let stripeClient: Stripe | null = null;

export function getStripeServerClient() {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
  }

  stripeClient = new Stripe(secretKey, { apiVersion });
  return stripeClient;
}
