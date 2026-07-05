import { ONLINE_STORE_START_SELLING_FUNNEL } from "@/config/service-funnels/online-store-start-selling";
import { SOCIAL_MEDIA_DONT_LOSE_TURNOVER_FUNNEL } from "@/config/service-funnels/social-media-dont-lose-turnover";
import type { ServiceFunnelConfig, ServiceFunnelDefinition } from "@/config/service-funnels/types";
import { getServiceById, resolveServiceSlug } from "@/lib/data/services";

const FUNNEL_DEFINITIONS = [
  SOCIAL_MEDIA_DONT_LOSE_TURNOVER_FUNNEL,
  ONLINE_STORE_START_SELLING_FUNNEL,
] as const;

function resolveFunnelConfig(definition: ServiceFunnelDefinition): ServiceFunnelConfig {
  const service = getServiceById(definition.serviceId);
  if (!service) {
    throw new Error(`Unknown serviceId in funnel config: ${definition.serviceId}`);
  }

  return {
    ...definition,
    serviceSlug: service.slug,
    pagePath: `/services/${service.slug}/${definition.funnelSlug}`,
  };
}

export const SERVICE_FUNNELS: ServiceFunnelConfig[] = FUNNEL_DEFINITIONS.map(resolveFunnelConfig);

export function getFunnelBySlugs(
  serviceSlug: string,
  funnelSlug: string,
): ServiceFunnelConfig | undefined {
  const canonicalSlug = resolveServiceSlug(serviceSlug);
  return SERVICE_FUNNELS.find(
    (funnel) => funnel.serviceSlug === canonicalSlug && funnel.funnelSlug === funnelSlug,
  );
}

export function getFunnelById(funnelId: string): ServiceFunnelConfig | undefined {
  return SERVICE_FUNNELS.find((funnel) => funnel.id === funnelId);
}

export function getFunnelsByServiceId(serviceId: string): ServiceFunnelConfig[] {
  return SERVICE_FUNNELS.filter((funnel) => funnel.serviceId === serviceId);
}

export type ServiceFunnelsGroup = {
  serviceId: string;
  serviceSlug: string;
  serviceName: string;
  funnels: ServiceFunnelConfig[];
};

export function getFunnelsGroupedByService(): ServiceFunnelsGroup[] {
  const groups = new Map<string, ServiceFunnelsGroup>();

  for (const funnel of SERVICE_FUNNELS) {
    const service = getServiceById(funnel.serviceId);
    const existing = groups.get(funnel.serviceId);

    if (existing) {
      existing.funnels.push(funnel);
      continue;
    }

    groups.set(funnel.serviceId, {
      serviceId: funnel.serviceId,
      serviceSlug: funnel.serviceSlug,
      serviceName: service?.name ?? funnel.serviceId,
      funnels: [funnel],
    });
  }

  return Array.from(groups.values());
}
