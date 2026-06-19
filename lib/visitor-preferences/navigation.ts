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

/** Where "Начало" / logo should navigate. */
export function getHomeNavigationPath(): string {
  return "/";
}

export function isHomeNavActive(pathname: string): boolean {
  try {
    return decodeURI(pathname) === "/";
  } catch {
    return pathname === "/";
  }
}
