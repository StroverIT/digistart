import { getServicePath } from "@/lib/visitor-preferences/paths";
import { getPreferences } from "@/lib/visitor-preferences/storage";

let homeRedirectSuppressed = false;

export function suppressHomeRedirect(): void {
  homeRedirectSuppressed = true;
}

export function isHomeRedirectSuppressed(): boolean {
  return homeRedirectSuppressed;
}

export function releaseHomeRedirectSuppression(): void {
  homeRedirectSuppressed = false;
}

/** Where "Начало" / logo should navigate for the current visitor. */
export function getHomeNavigationPath(): string {
  const prefs = getPreferences();
  if (prefs) return getServicePath(prefs.primaryService);
  return "/";
}

function normalizePathForMatch(path: string): string {
  try {
    const decoded = decodeURI(path);
    if (decoded.length > 1 && decoded.endsWith("/")) {
      return decoded.slice(0, -1) || "/";
    }
    return decoded;
  } catch {
    return path;
  }
}

function pathMatches(pathname: string, paths: readonly string[]): boolean {
  const decoded = normalizePathForMatch(pathname);
  return paths.some((p) => {
    const target = normalizePathForMatch(p);
    if (target === pathname || target === decoded) return true;
    if (target === "/") return false;
    return pathname.startsWith(`${target}/`) || decoded.startsWith(`${target}/`);
  });
}

export function isHomeNavActive(pathname: string): boolean {
  if (pathMatches(pathname, ["/"])) return true;
  const prefs = getPreferences();
  if (!prefs) return false;
  return pathMatches(pathname, [getServicePath(prefs.primaryService)]);
}
