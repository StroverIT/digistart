/**
 * First-party DigiStart analytics: page views per calendar day in localStorage.
 * Feeds admin dashboard visit counts; no third-party scripts.
 */

const STORAGE_KEY = "digistart-site-analytics";
const MAX_DAYS_RETAINED = 366;

export interface SiteAnalyticsStore {
  /** ISO date YYYY-MM-DD → number of page views recorded that day */
  dailyPageViews: Record<string, number>;
}

function emptyStore(): SiteAnalyticsStore {
  return { dailyPageViews: {} };
}

function load(): SiteAnalyticsStore {
  if (typeof window === "undefined") return emptyStore();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyStore();
  try {
    const parsed = JSON.parse(raw) as Partial<SiteAnalyticsStore>;
    if (!parsed.dailyPageViews || typeof parsed.dailyPageViews !== "object") {
      return emptyStore();
    }
    return { dailyPageViews: parsed.dailyPageViews };
  } catch {
    return emptyStore();
  }
}

function save(store: SiteAnalyticsStore): void {
  if (typeof window === "undefined") return;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - MAX_DAYS_RETAINED);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  const pruned: Record<string, number> = {};
  for (const [date, count] of Object.entries(store.dailyPageViews)) {
    if (date >= cutoffStr && count > 0) pruned[date] = count;
  }
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ dailyPageViews: pruned })
  );
}

/** Record a client-side page view (route change). Skips admin and Next internals. */
export function recordPageView(pathname: string): void {
  if (typeof window === "undefined") return;
  if (!pathname || pathname.startsWith("/admin")) return;
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") // static files
  ) {
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const store = load();
  store.dailyPageViews[today] = (store.dailyPageViews[today] ?? 0) + 1;
  save(store);
}

/** Map of ISO date → page views for the last `days` days (inclusive of today). */
export function getDailyPageViewCounts(days: number): Map<string, number> {
  const map = new Map<string, number>();
  if (typeof window === "undefined") return map;

  const store = load();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    map.set(dateStr, store.dailyPageViews[dateStr] ?? 0);
  }
  return map;
}
