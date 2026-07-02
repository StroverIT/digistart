import { SERVICE_FUNNELS } from "@/config/service-funnels";

function decodePathname(pathname: string): string {
  try {
    return decodeURI(pathname);
  } catch {
    return pathname;
  }
}

export function isServiceFunnelPath(pathname: string): boolean {
  const decoded = decodePathname(pathname);
  return SERVICE_FUNNELS.some(
    (funnel) => funnel.pagePath === pathname || funnel.pagePath === decoded,
  );
}
