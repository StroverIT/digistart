"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  COOKIE_CONSENT_UPDATED_EVENT,
  hasAdsConsent,
  type CookieConsentState,
} from "@/lib/cookies/consent";
import {
  ensureMetaPixelInitialized,
  META_PIXEL_ID,
  type MetaPixelUserInfo,
} from "@/lib/analytics/meta-pixel";

function matchingUserFromSession(session: {
  user?: { id?: string; email?: string | null; name?: string | null };
} | null): MetaPixelUserInfo | undefined {
  const user = session?.user;
  if (!user?.email && !user?.id && !user?.name) return undefined;

  const nameParts = (user.name ?? "").trim().split(/\s+/).filter(Boolean);
  return {
    email: user.email,
    firstName: nameParts[0],
    lastName: nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined,
    externalId: user.id,
  };
}

/**
 * Manual Advanced Matching: when the visitor is signed in (or ads consent
 * is granted), pass email/name/id into fbq('init', pixelId, { em, fn, ... }).
 */
export function MetaPixelAdvancedMatching() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (!META_PIXEL_ID) return;

    const apply = () => {
      if (!hasAdsConsent()) return;
      const user =
        status === "authenticated" ? matchingUserFromSession(session) : undefined;
      ensureMetaPixelInitialized(user);
    };

    apply();

    const onConsentUpdated = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsentState>).detail;
      if (detail?.ads) apply();
    };

    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdated);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdated);
    };
  }, [session, status]);

  return null;
}
