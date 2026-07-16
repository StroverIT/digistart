import { getFunnelByPathname } from "@/lib/service-funnels/path";

export function formatConsultationSourceLabel(
  sourcePage?: string,
  pagePath?: string,
  source?: string,
): string {
  if (pagePath) {
    const funnel = getFunnelByPathname(pagePath);
    if (funnel) return funnel.adminLabel;
  }

  if (sourcePage) return sourcePage;
  if (pagePath) return pagePath;

  if (source === "checkout") return "Checkout";
  if (source === "public") return "Публична форма";

  return source ?? "-";
}
