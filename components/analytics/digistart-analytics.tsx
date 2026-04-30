"use client";

import { usePathname } from "next/navigation";
import { usePageAnalytics } from "@/hooks/use-page-analytics";

/**
 * Tracks SPA route changes through the server analytics pipeline.
 * Renders nothing.
 */
export function DigiStartAnalytics() {
  const pathname = usePathname();
  const trackedPath = pathname?.startsWith("/admin") ? "" : pathname ?? "";
  usePageAnalytics(trackedPath);

  return null;
}
