import { getTemplateForOnboarding, productCategories } from "@/lib/data/templates";
import { isProjectOnboardingComplete } from "@/lib/onboarding/completion";
import {
  getOnboardingRequirements,
  ONBOARDING_SERVICE_IDS,
} from "@/lib/onboarding/requirements";
import {
  buildServiceSetupProgress,
  getRequirementsForOrderItem,
} from "@/lib/onboarding/service-setup-status";
import { getOrderByIdFromDb } from "@/lib/server/orders";
import { getStoreDomainByOrderItemId } from "@/lib/server/store-domains";
import {
  getTenantProjectForOrder,
  type TenantProjectDto,
} from "@/lib/server/tenant-projects";
import { ONLINE_STORE_SERVICE_ID } from "@/lib/store-dns";
import { prisma } from "@/lib/prisma";
import type { Order } from "@/lib/types";

export type OrderAdminServiceSetup = {
  orderItemId: string;
  serviceId: string;
  serviceName: string;
  doneCount: number;
  total: number;
  incomplete: boolean;
  items: { id: string; title: string; description: string; ok: boolean }[];
};

export type OrderAdminDetails = {
  order: Order;
  user: {
    name: string | null;
    email: string;
    phone: string | null;
    company: string | null;
  } | null;
  project: TenantProjectDto | null;
  template: {
    id: string;
    name: string;
    previewPath: string | null;
  } | null;
  productCategoryLabel: string | null;
  companyVat: string | null;
  onboarding: {
    isComplete: boolean;
    setupStatus: string | null;
    onboardingStep: number | null;
    serviceSetup: OrderAdminServiceSetup[];
  };
  domains: {
    orderItemId: string;
    domain: string;
    status: string;
    adminNotes: string | null;
  }[];
};

function productCategoryLabel(category: string | null | undefined): string | null {
  if (!category) return null;
  return productCategories.find((c) => c.id === category)?.name ?? category;
}

export async function getOrderAdminDetailsFromDb(
  orderId: string,
): Promise<OrderAdminDetails | null> {
  const order = await getOrderByIdFromDb(orderId);
  if (!order) return null;

  const orderRow = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      userId: true,
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          company: true,
        },
      },
    },
  });

  const project = await getTenantProjectForOrder(orderId, orderRow?.userId);
  const orderItemsForRequirements = order.cart.items.map((item) => ({
    serviceId: item.serviceId,
    upsells: item.upsells,
  }));
  const requirements = getOnboardingRequirements(orderItemsForRequirements);
  const hasLogo = Boolean(order.brandAssets?.logoUrl);
  const hasPalette = Boolean(order.brandAssets?.paletteUrl);

  const onboardingServiceItems = order.cart.items.filter((item) =>
    (ONBOARDING_SERVICE_IDS as readonly string[]).includes(item.serviceId),
  );

  const serviceSetup: OrderAdminServiceSetup[] = await Promise.all(
    onboardingServiceItems.map(async (item) => {
      const domain =
        item.serviceId === ONLINE_STORE_SERVICE_ID
          ? await getStoreDomainByOrderItemId(item.id)
          : null;
      const itemRequirements = getRequirementsForOrderItem(
        orderItemsForRequirements,
        item.serviceId,
      );
      const progress = buildServiceSetupProgress({
        serviceId: item.serviceId,
        orderItemId: item.id,
        project,
        requirements: itemRequirements,
        hasLogo,
        hasPalette,
        domain,
      });

      return {
        orderItemId: item.id,
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        doneCount: progress.doneCount,
        total: progress.total,
        incomplete: progress.incomplete,
        items: progress.items.map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          ok: row.ok,
        })),
      };
    }),
  );

  const template =
    project?.templateId && project.productCategory
      ? getTemplateForOnboarding(project.productCategory, project.templateId)
      : null;

  const companyVat =
    typeof order.stripe?.metadata?.companyVat === "string"
      ? order.stripe.metadata.companyVat
      : null;

  const domains = (
    await Promise.all(
      order.cart.items
        .filter((item) => item.serviceId === ONLINE_STORE_SERVICE_ID)
        .map(async (item) => {
          const row = await getStoreDomainByOrderItemId(item.id);
          return row
            ? {
                orderItemId: item.id,
                domain: row.domain,
                status: row.status,
                adminNotes: row.adminNotes,
              }
            : null;
        }),
    )
  ).filter((row): row is NonNullable<typeof row> => row !== null);

  return {
    order,
    user: orderRow?.user ?? null,
    project,
    template: template
      ? {
          id: template.id,
          name: template.name,
          previewPath: project?.previewPath ?? template.previewPath,
        }
      : null,
    productCategoryLabel: productCategoryLabel(project?.productCategory),
    companyVat,
    onboarding: {
      isComplete: isProjectOnboardingComplete(project, requirements),
      setupStatus: project?.setupStatus ?? null,
      onboardingStep: project?.onboardingStep ?? null,
      serviceSetup,
    },
    domains,
  };
}
