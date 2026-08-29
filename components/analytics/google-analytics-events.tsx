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
import { getFunnelByPathname } from "@/lib/service-funnels/path";

/**
 * Fires GA4 page_view on SPA route changes after ads/analytics consent.
 * Skips admin routes. Includes funnel content metadata when available.
 */
export function GoogleAnalyticsEvents() {
  const pathname = usePathname();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    const trackIfAllowed = () => {
      if (!pathname || pathname.startsWith("/admin") || !hasAdsConsent()) return;
      const key = `${pathname}${typeof window !== "undefined" ? window.location.search : ""}`;
      if (lastTrackedRef.current === key) return;
      lastTrackedRef.current = key;

      // Title often updates after the pathname effect; defer one frame.
      requestAnimationFrame(() => {
        const funnel = getFunnelByPathname(pathname);
        if (funnel) {
          trackGoogleAnalyticsPageView(pathname, {
            content_name: funnel.metaPageView.contentName,
            content_ids: [funnel.id],
            view_source: funnel.metaPageView.viewSource,
          });
          return;
        }
        trackGoogleAnalyticsPageView(pathname);
      });
    };

    trackIfAllowed();

    const onConsentUpdated = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsentState>).detail;
      if (detail?.ads) {
        lastTrackedRef.current = null;
        trackIfAllowed();
      }
    };

    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdated);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdated);
    };
  }, [pathname]);

  return null;
}
