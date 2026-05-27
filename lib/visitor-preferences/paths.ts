import type { VisitorServiceId } from "@/lib/visitor-preferences/types";

export const VISITOR_SERVICE_PATHS: Record<VisitorServiceId, string> = {
  "online-store": "/services/online-store",
  "ai-automation": "/services/ai-automation",
  "social-media": "/services/social-media",
  ads: "/services/ads",
  "google-business": "/services/google-business",
};

export function getServicePath(serviceId: VisitorServiceId): string {
  return VISITOR_SERVICE_PATHS[serviceId];
}
