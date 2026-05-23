/**
 * Shared rules for IS_COMING_SOON mode (middleware + root layout).
 * Keep this file Edge-safe (no Node-only APIs).
 */

export function isComingSoonEnabled(): boolean {
  return ["1", "true", "yes", "on"].includes(
    (process.env.IS_COMING_SOON ?? "").trim().toLowerCase(),
  );
}

/** Paths that must keep working as full app routes during coming soon. */
export function isComingSoonBypassPath(pathname: string): boolean {
  const path = pathname || "/";
  if (path.startsWith("/admin")) return true;
  if (path.startsWith("/api/auth")) return true;
  if (path.startsWith("/api/admin/analytics")) return true;
  if (path.startsWith("/api/analytics/utm")) return true;
  if (path.startsWith("/api/newsletter/subscribe")) return true;
  if (path.startsWith("/api/stripe/webhook")) return true;
  if (path.startsWith("/user")) return true;
  return false;
}

/** API routes allowed while coming soon (others return 503). */
export function isComingSoonAllowedApiPath(pathname: string): boolean {
  const path = pathname || "/";
  if (path.startsWith("/api/auth")) return true;
  if (path.startsWith("/api/admin/analytics")) return true;
  if (path.startsWith("/api/analytics/utm")) return true;
  if (path.startsWith("/api/newsletter/subscribe")) return true;
  if (path.startsWith("/api/stripe/webhook")) return true;
  if (path.startsWith("/api/support-chats")) return true;
  return false;
}

export function isStaticOrNextAssetPath(pathname: string): boolean {
  const path = pathname || "/";
  if (path.startsWith("/_next")) return true;
  if (path === "/favicon.ico" || path === "/robots.txt" || path === "/sitemap.xml") {
    return true;
  }
  return /\.(ico|png|jpe?g|gif|webp|svg|txt|xml|woff2?|ttf|eot|map)$/i.test(path);
}

/** Root layout: show coming soon shell instead of site + providers. */
export function shouldRenderComingSoonInLayout(pathname: string): boolean {
  if (!isComingSoonEnabled()) return false;
  if (isComingSoonBypassPath(pathname)) return false;
  if (isStaticOrNextAssetPath(pathname)) return false;
  return true;
}
