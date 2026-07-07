import { getAnalyticsSessionId } from "@/lib/analytics/tracker";
import type { CompetitorPlatform } from "@/lib/funnel/competitor-platform";

export function trackFunnelCompetitorSelection(params: {
  funnelId: string;
  platform: CompetitorPlatform;
  page?: string;
  otherLabel?: string;
}): void {
  if (typeof window === "undefined") return;

  const page = params.page ?? window.location.pathname + window.location.search;

  void fetch("/api/analytics/funnel-competitor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      funnelId: params.funnelId,
      platform: params.platform,
      page,
      sessionId: getAnalyticsSessionId(),
      otherLabel: params.otherLabel,
    }),
    keepalive: true,
  }).catch(() => {});
}
