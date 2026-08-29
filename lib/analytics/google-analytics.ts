/**
 * Google Analytics 4 (gtag.js) helpers.
 *
 * Env:
 * - NEXT_PUBLIC_GA_MEASUREMENT_ID - GA4 measurement ID (disabled if unset)
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

let gaInitStarted = false;

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

function injectGtagScript(measurementId: string): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("ga-gtag-js")) return;

  const script = document.createElement("script");
  script.id = "ga-gtag-js";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

/**
 * Install gtag stub + script and call gtag('config', measurementId).
 * Safe to call multiple times; only initializes once.
 */
export function ensureGoogleAnalyticsInitialized(): void {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID) return;
  if (gaInitStarted) return;

  gaInitStarted = true;
  ensureGtagStub();
  injectGtagScript(GA_MEASUREMENT_ID);
  window.gtag?.("js", new Date());
  window.gtag?.("config", GA_MEASUREMENT_ID, {
    send_page_view: false,
  });
}

/**
 * SPA page_view for App Router navigations.
 */
export function trackGoogleAnalyticsPageView(pagePath: string): void {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined") return;
  ensureGoogleAnalyticsInitialized();
  window.gtag?.("event", "page_view", {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
  });
}
