"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  COOKIE_CONSENT_UPDATED_EVENT,
  hasAdsConsent,
  type CookieConsentState,
} from "@/lib/cookies/consent";
import {
  GA_MEASUREMENT_ID,
  trackGoogleAnalyticsPageView,
} from "@/lib/analytics/google-analytics";

/**
 * Fires GA4 page_view on SPA route changes after ads/analytics consent.
 * Skips admin routes.
 */
export function GoogleAnalyticsEvents() {
  const pathname = usePathname();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    const trackIfAllowed = () => {
      if (!pathname || pathname.startsWith("/admin") || !hasAdsConsent()) return;
      if (lastTrackedRef.current === pathname) return;
      lastTrackedRef.current = pathname;
      trackGoogleAnalyticsPageView(pathname);
    };

    trackIfAllowed();

    const onConsentUpdated = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsentState>).detail;
      if (detail?.ads) trackIfAllowed();
    };

    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdated);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdated);
    };
  }, [pathname]);

  return null;
}
