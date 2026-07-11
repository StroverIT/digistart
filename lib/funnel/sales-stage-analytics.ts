import { getAnalyticsSessionId } from "@/lib/analytics/tracker";
import type { SalesStagePathId } from "@/lib/funnel/sales-stage";

export function trackFunnelSalesStageSelection(params: {
  funnelId: string;
  pathId: SalesStagePathId;
  page?: string;
}): void {
  if (typeof window === "undefined") return;

  const page = params.page ?? window.location.pathname + window.location.search;

  void fetch("/api/analytics/funnel-sales-stage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      funnelId: params.funnelId,
      pathId: params.pathId,
      page,
      sessionId: getAnalyticsSessionId(),
    }),
    keepalive: true,
  }).catch(() => {});
}
