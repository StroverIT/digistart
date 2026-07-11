import type { ServiceFunnelPasConfig } from "@/config/service-funnels/types";

export type FunnelScrollTarget = "consultation" | "booking" | "checkout";

export function resolveFunnelScrollTarget(
  config: Pick<ServiceFunnelPasConfig, "checkout" | "features">,
): FunnelScrollTarget {
  if (config.checkout) return "checkout";
  if (config.features?.consultationOnlyEnd) return "consultation";
  return "booking";
}

export function buildFunnelScrollCtaId(
  analyticsCtaId: string,
  section: string,
  target: FunnelScrollTarget,
): string {
  const base = analyticsCtaId.replace(/_(consultation|booking|checkout)_submit$/, "");
  return `${base}_section_${section}_scroll_${target}`;
}
