"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { hasAdsConsent } from "@/lib/cookies/consent";
import { trackMetaPageView } from "@/lib/analytics/meta-pixel";
import { getFunnelByPathname } from "@/lib/service-funnels/path";

/**
 * Fires Meta PageView (with unique event_id) on SPA route changes.
 * Skips admin routes.
 */
export function MetaPixelEvents() {
  const pathname = usePathname();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || !hasAdsConsent()) return;
    if (lastTrackedRef.current === pathname) return;
    lastTrackedRef.current = pathname;

    const funnel = getFunnelByPathname(pathname);
    if (funnel) {
      trackMetaPageView({
        page_path: pathname,
        content_name: funnel.metaPageView.contentName,
        content_ids: [funnel.id],
        view_source: funnel.metaPageView.viewSource,
      });
      return;
    }

    trackMetaPageView(pathname);
  }, [pathname]);

  return null;
}
