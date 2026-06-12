"use client";

import type { CheckoutFunnelStage } from "@/lib/analytics/checkout-funnel";
import { getAnalyticsSessionId } from "@/lib/analytics/tracker";

export function recordCheckoutFunnelStage(
  stage: CheckoutFunnelStage,
  metadata: {
    logicalStep: number;
    totalSteps: number;
    isLoggedIn: boolean;
  },
): void {
  if (typeof window === "undefined") return;

  fetch("/api/analytics/checkout-funnel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      stage,
      action: "view",
      logicalStep: metadata.logicalStep,
      totalSteps: metadata.totalSteps,
      isLoggedIn: metadata.isLoggedIn,
      sessionId: getAnalyticsSessionId(),
      page: window.location.pathname,
    }),
    keepalive: true,
  })
    .then(() => {})
    .catch(() => {});
}
