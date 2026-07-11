"use client";

import type { ReactNode } from "react";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import {
  buildFunnelScrollCtaId,
  resolveFunnelScrollTarget,
} from "@/lib/funnel/funnel-cta-analytics";
import type { ServiceFunnelPasConfig } from "@/config/service-funnels/types";

type FunnelScrollCtaLinkProps = {
  config: Pick<ServiceFunnelPasConfig, "analyticsCtaId" | "checkout" | "features">;
  section: string;
  href?: string;
  className?: string;
  children: ReactNode;
};

export function FunnelScrollCtaLink({
  config,
  section,
  href,
  className,
  children,
}: FunnelScrollCtaLinkProps) {
  const target = resolveFunnelScrollTarget(config);
  const ctaId = buildFunnelScrollCtaId(config.analyticsCtaId, section, target);

  return (
    <TrackedCtaLink href={href ?? `#${target}`} ctaId={ctaId} className={className}>
      {children}
    </TrackedCtaLink>
  );
}
