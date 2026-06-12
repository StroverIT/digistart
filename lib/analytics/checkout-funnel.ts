export const CHECKOUT_FUNNEL_STAGES = ["account", "business", "payment"] as const;

export type CheckoutFunnelStage = (typeof CHECKOUT_FUNNEL_STAGES)[number];

export const CHECKOUT_FUNNEL_STAGE_LABELS: Record<CheckoutFunnelStage, string> = {
  account: "Акаунт",
  business: "Фирма",
  payment: "Плащане",
};

export function getCheckoutStage(
  logicalStep: number,
  isLoggedIn: boolean,
): CheckoutFunnelStage {
  if (isLoggedIn) {
    return logicalStep === 1 ? "business" : "payment";
  }
  if (logicalStep === 1) return "account";
  if (logicalStep === 2) return "business";
  return "payment";
}

export function isCheckoutFunnelStage(value: string): value is CheckoutFunnelStage {
  return (CHECKOUT_FUNNEL_STAGES as readonly string[]).includes(value);
}
