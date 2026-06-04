"use client";

import { useEffect } from "react";
import {
  COOKIE_CONSENT_UPDATED_EVENT,
  hasAdsConsent,
  type CookieConsentState,
} from "@/lib/cookies/consent";
import { ensureMetaPixelInitialized, META_PIXEL_ID } from "@/lib/analytics/meta-pixel";

/**
 * Loads Meta Pixel only after the visitor accepts advertising cookies.
 */
export function MetaPixelConsentLoader() {
  useEffect(() => {
    if (!META_PIXEL_ID) return;

    const maybeInit = () => {
      if (hasAdsConsent()) {
        ensureMetaPixelInitialized();
      }
    };

    maybeInit();

    const onConsentUpdated = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsentState>).detail;
      if (detail?.ads) {
        ensureMetaPixelInitialized();
      }
    };

    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdated);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdated);
    };
  }, []);

  return null;
}
