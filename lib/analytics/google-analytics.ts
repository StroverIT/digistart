/**
 * Google Analytics 4 (gtag.js) helpers.
 *
 * Sends recommended GA4 events aligned with Meta Pixel conversions:
 * page_view, generate_lead, add_to_cart, begin_checkout, purchase.
 *
 * Env:
 * - NEXT_PUBLIC_GA_MEASUREMENT_ID - GA4 measurement ID (disabled if unset)
 * - NEXT_PUBLIC_META_CURRENCY - ISO 4217, default EUR (shared with Meta)
 */

import { hasAdsConsent } from "@/lib/cookies/consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
const GA_CURRENCY = process.env.NEXT_PUBLIC_META_CURRENCY ?? "EUR";

let gaInitStarted = false;
let consentDefaultSet = false;

export type GaLineItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type GaItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
};

function toGaItems(items: GaLineItem[]): GaItem[] {
  return items.map((item) => ({
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));
}

function sumValue(items: GaLineItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function ensureGtagStub(): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  if (typeof window.gtag === "function") return;
  // Match Google's snippet: push the Arguments object, not a rest array.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };
}

/**
 * Consent Mode v2 defaults (must run before any GA tags).
 * Safe to call multiple times.
 */
export function ensureGoogleAnalyticsConsentDefaults(): void {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID || consentDefaultSet) return;
  consentDefaultSet = true;
  ensureGtagStub();
  window.gtag?.("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500,
  });
}

/**
 * Update Consent Mode after the visitor accepts or rejects ads/analytics cookies.
 */
export function updateGoogleAnalyticsConsent(granted: boolean): void {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID) return;
  ensureGoogleAnalyticsConsentDefaults();
  const value = granted ? "granted" : "denied";
  window.gtag?.("consent", "update", {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  });
}

function injectGtagScript(measurementId: string): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("ga-gtag-js")) return;

  const script = document.createElement("script");
  script.id = "ga-gtag-js";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

function canSendEvents(): boolean {
  return Boolean(GA_MEASUREMENT_ID && typeof window !== "undefined" && hasAdsConsent());
}

/**
 * Install gtag + Consent Mode, then config the measurement ID.
 * Safe to call multiple times; only initializes once.
 */
export function ensureGoogleAnalyticsInitialized(): void {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID) return;

  ensureGoogleAnalyticsConsentDefaults();

  if (hasAdsConsent()) {
    updateGoogleAnalyticsConsent(true);
  }

  if (gaInitStarted) return;
  gaInitStarted = true;

  injectGtagScript(GA_MEASUREMENT_ID);
  window.gtag?.("js", new Date());
  window.gtag?.("config", GA_MEASUREMENT_ID, {
    send_page_view: false,
    anonymize_ip: true,
    currency: GA_CURRENCY,
  });
}

function gtagEvent(eventName: string, params: Record<string, unknown>): void {
  if (!canSendEvents()) return;
  ensureGoogleAnalyticsInitialized();
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      cleaned[key] = value;
    }
  }
  window.gtag?.("event", eventName, cleaned);
}

/**
 * SPA page_view for App Router navigations.
 */
export function trackGoogleAnalyticsPageView(
  pagePath: string,
  extra?: {
    content_name?: string;
    content_ids?: string[];
    view_source?: string;
  },
): void {
  if (!canSendEvents()) return;
  ensureGoogleAnalyticsInitialized();

  const pathWithQuery =
    typeof window !== "undefined"
      ? `${pagePath}${window.location.search || ""}`
      : pagePath;

  window.gtag?.("event", "page_view", {
    page_path: pathWithQuery,
    page_location: window.location.href,
    page_title: document.title,
    ...(extra?.content_name ? { content_name: extra.content_name } : {}),
    ...(extra?.content_ids?.length ? { content_ids: extra.content_ids } : {}),
    ...(extra?.view_source ? { content_group: extra.view_source } : {}),
  });
}

/**
 * Recommended GA4 event for form / newsletter / consultation leads.
 */
export function trackGoogleAnalyticsGenerateLead(params: {
  content_name: string;
  page_path?: string;
  lead_source?: string;
  value?: number;
  currency?: string;
}): void {
  gtagEvent("generate_lead", {
    currency: params.currency ?? GA_CURRENCY,
    value: typeof params.value === "number" && params.value > 0 ? params.value : undefined,
    lead_source: params.lead_source,
    content_name: params.content_name,
    page_path: params.page_path,
  });
}

/**
 * Recommended GA4 ecommerce: add_to_cart.
 */
export function trackGoogleAnalyticsAddToCart(
  lineItems: GaLineItem[],
  extra?: { page_path?: string },
): void {
  const items = toGaItems(lineItems);
  gtagEvent("add_to_cart", {
    currency: GA_CURRENCY,
    value: sumValue(lineItems),
    items,
    page_path: extra?.page_path,
  });
}

/**
 * Recommended GA4 ecommerce: begin_checkout.
 */
export function trackGoogleAnalyticsBeginCheckout(
  lineItems: GaLineItem[],
  extra?: { page_path?: string },
): void {
  const items = toGaItems(lineItems);
  gtagEvent("begin_checkout", {
    currency: GA_CURRENCY,
    value: sumValue(lineItems),
    items,
    page_path: extra?.page_path ?? "/checkout",
  });
}

/**
 * Recommended GA4 ecommerce: purchase (requires unique transaction_id).
 */
export function trackGoogleAnalyticsPurchase(params: {
  lineItems: GaLineItem[];
  value: number;
  transactionId: string;
  page_path?: string;
}): void {
  const items = toGaItems(params.lineItems);
  gtagEvent("purchase", {
    transaction_id: params.transactionId,
    currency: GA_CURRENCY,
    value: params.value,
    items,
    page_path: params.page_path ?? "/checkout/success",
  });
}

export { GA_CURRENCY };
