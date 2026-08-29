"use client";

import { useEffect } from "react";
import {
  COOKIE_CONSENT_UPDATED_EVENT,
  hasAdsConsent,
  type CookieConsentState,
} from "@/lib/cookies/consent";
import {
  ensureGoogleAnalyticsInitialized,
  GA_MEASUREMENT_ID,
} from "@/lib/analytics/google-analytics";

/**
 * Loads Google Analytics (gtag.js) only after the visitor accepts
 * advertising / analytics cookies.
 */
export function GoogleAnalyticsConsentLoader() {
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    const maybeInit = () => {
      if (hasAdsConsent()) {
        ensureGoogleAnalyticsInitialized();
      }
    };

    maybeInit();

    const onConsentUpdated = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsentState>).detail;
      if (detail?.ads) {
        ensureGoogleAnalyticsInitialized();
      }
    };

    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdated);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdated);
    };
  }, []);

  return null;
}
