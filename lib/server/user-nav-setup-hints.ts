import {
  buildServiceSetupProgress,
  getRequirementsForOrderItem,
} from "@/lib/onboarding/service-setup-status";
import { ONBOARDING_SERVICE_IDS } from "@/lib/onboarding/requirements";
import { getStoreDomainByOrderItemId } from "@/lib/server/store-domains";
import type { TenantProjectDto } from "@/lib/server/tenant-projects";
import { ONLINE_STORE_SERVICE_ID } from "@/lib/store-dns";

type OrderItemRow = {
  id: string;
  serviceId: string;
  upsells: unknown;
  order: {
    brandAssets: unknown;
    items: { serviceId: string; upsells: unknown }[];
  };
};

export type ServiceNavSetupHint = {
  orderItemId: string;
  incomplete: boolean;
  missingCount: number;
};

export async function getServiceNavSetupHints(params: {
  orderItems: OrderItemRow[];
  tenantProject: TenantProjectDto | null;
}): Promise<Record<string, ServiceNavSetupHint>> {
  const hints: Record<string, ServiceNavSetupHint> = {};

  for (const item of params.orderItems) {
    if (!(ONBOARDING_SERVICE_IDS as readonly string[]).includes(item.serviceId)) {
      continue;
    }

    const orderItemsForReq = item.order.items.map((row) => ({
      serviceId: row.serviceId,
      upsells: row.upsells,
    }));
    const requirements = getRequirementsForOrderItem(orderItemsForReq, item.serviceId);

    let domain = null;
    if (item.serviceId === ONLINE_STORE_SERVICE_ID) {
      try {
        domain = await getStoreDomainByOrderItemId(item.id);
      } catch {
        domain = null;
      }
    }

    const brandAssets =
      (item.order.brandAssets as { logoUrl?: string | null; paletteUrl?: string | null } | null) ??
      null;

    const progress = buildServiceSetupProgress({
      serviceId: item.serviceId,
      orderItemId: item.id,
      project: params.tenantProject,
      requirements,
      hasLogo: Boolean(brandAssets?.logoUrl),
      hasPalette: Boolean(brandAssets?.paletteUrl),
      domain,
    });

    hints[item.id] = {
      orderItemId: item.id,
      incomplete: progress.incomplete,
      missingCount: progress.total - progress.doneCount,
    };
  }

  return hints;
}
