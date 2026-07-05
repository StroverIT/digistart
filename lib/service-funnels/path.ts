import { SERVICE_FUNNELS } from "@/config/service-funnels";
import type { ServiceFunnelConfig } from "@/config/service-funnels/types";

function decodePathname(pathname: string): string {
  try {
    return decodeURI(pathname);
  } catch {
    return pathname;
  }
}

function matchesFunnelPath(pathname: string, pagePath: string): boolean {
  const decoded = decodePathname(pathname);
  return pagePath === pathname || pagePath === decoded;
}

export function getFunnelByPathname(pathname: string): ServiceFunnelConfig | undefined {
  return SERVICE_FUNNELS.find((funnel) => matchesFunnelPath(pathname, funnel.pagePath));
}

export function isServiceFunnelPath(pathname: string): boolean {
  return getFunnelByPathname(pathname) !== undefined;
}
