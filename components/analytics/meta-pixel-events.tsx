"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackMetaPageView } from "@/lib/analytics/meta-pixel";

/**
 * Fires Meta PageView (with unique event_id) on SPA route changes.
 * Skips admin routes.
 */
export function MetaPixelEvents() {
  const pathname = usePathname();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (lastTrackedRef.current === pathname) return;
    lastTrackedRef.current = pathname;
    trackMetaPageView(pathname);
  }, [pathname]);

  return null;
}
