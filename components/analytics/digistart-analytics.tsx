"use client";

import { usePathname } from "next/navigation";
import { usePageAnalytics } from "@/hooks/use-page-analytics";
import { getFunnelByPathname } from "@/lib/service-funnels/path";

/**
 * Tracks SPA route changes through the server analytics pipeline.
 * Renders nothing.
 */
export function DigiStartAnalytics() {
  const pathname = usePathname();
  const trackedPath = pathname?.startsWith("/admin") ? "" : (pathname ?? "");
  const funnel = trackedPath ? getFunnelByPathname(trackedPath) : undefined;
  const pageViewMetadata = funnel
    ? {
        funnel_id: funnel.id,
        view_source: funnel.metaPageView.viewSource,
      }
    : undefined;

  usePageAnalytics(trackedPath, pageViewMetadata);

  return null;
}
