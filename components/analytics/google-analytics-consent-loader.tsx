"use client";

import { useEffect } from "react";
import {
  COOKIE_CONSENT_UPDATED_EVENT,
  hasAdsConsent,
  readCookieConsent,
  type CookieConsentState,
} from "@/lib/cookies/consent";
import {
  ensureGoogleAnalyticsConsentDefaults,
  ensureGoogleAnalyticsInitialized,
  GA_MEASUREMENT_ID,
  updateGoogleAnalyticsConsent,
} from "@/lib/analytics/google-analytics";

/**
 * Sets Consent Mode defaults immediately, then loads GA4 after ads/analytics consent.
 */
export function GoogleAnalyticsConsentLoader() {
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    ensureGoogleAnalyticsConsentDefaults();

    const existing = readCookieConsent();
    if (existing) {
      updateGoogleAnalyticsConsent(Boolean(existing.ads));
      if (existing.ads) ensureGoogleAnalyticsInitialized();
    }

    const onConsentUpdated = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsentState>).detail;
      const granted = Boolean(detail?.ads);
      updateGoogleAnalyticsConsent(granted);
      if (granted) {
        ensureGoogleAnalyticsInitialized();
      }
    };

    // Re-check in case consent was granted before this listener attached.
    if (hasAdsConsent()) {
      ensureGoogleAnalyticsInitialized();
    }

    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdated);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdated);
    };
  }, []);

  return null;
}
