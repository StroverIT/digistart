"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordPageView } from "@/lib/store/site-analytics";

/**
 * Tracks SPA route changes into localStorage for the admin dashboard.
 * Renders nothing.
 */
export function DigiStartAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) recordPageView(pathname);
  }, [pathname]);

  return null;
}
