import {
  ONLINE_STORE_MASHINA_ZA_PRODAZHBI_SELLING_FUNNEL,
  ONLINE_STORE_MASHINA_ZA_PRODAZHBI_STARTING_FUNNEL,
} from "@/config/service-funnels/online-store-mashina-za-prodazhbi";
import { ONLINE_STORE_START_SELLING_FUNNEL } from "@/config/service-funnels/online-store-start-selling";
import { ONLINE_STORE_STOP_BEING_TECHIE_FUNNEL } from "@/config/service-funnels/online-store-stop-being-techie";
import { SOCIAL_MEDIA_DONT_LOSE_TURNOVER_FUNNEL } from "@/config/service-funnels/social-media-dont-lose-turnover";
import type {
  ServiceFunnelConfig,
  ServiceFunnelDefinition,
  ServiceFunnelPasConfig,
} from "@/config/service-funnels/types";
import { getServiceById, resolveServiceSlug } from "@/lib/data/services";

const FUNNEL_DEFINITIONS = [
  SOCIAL_MEDIA_DONT_LOSE_TURNOVER_FUNNEL,
  ONLINE_STORE_START_SELLING_FUNNEL,
  ONLINE_STORE_MASHINA_ZA_PRODAZHBI_STARTING_FUNNEL,
  ONLINE_STORE_MASHINA_ZA_PRODAZHBI_SELLING_FUNNEL,
  ONLINE_STORE_STOP_BEING_TECHIE_FUNNEL,
] as const;

function resolveFunnelConfig(definition: ServiceFunnelDefinition): ServiceFunnelConfig {
  const service = getServiceById(definition.serviceId);
  if (!service) {
    throw new Error(`Unknown serviceId in funnel config: ${definition.serviceId}`);
  }

  const shared = {
    serviceSlug: service.slug,
    pagePath: `/services/${service.slug}/${definition.funnelSlug}`,
  };

  if (definition.layout === "ready-store-v2") {
    return { ...definition, ...shared };
  }

  return { ...definition, ...shared } as ServiceFunnelPasConfig;
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

export { isPasFunnel, isReadyStoreV2Funnel } from "@/config/service-funnels/types";

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
