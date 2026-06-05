import type { Prisma } from "@prisma/client";
import { getTemplateForOnboarding } from "@/lib/data/templates";
import {
  resolvePreviewPathBySlug,
  resolveTemplatePreviewUrl,
} from "@/lib/preview-url";
import { prisma } from "@/lib/prisma";

export type TenantProjectDto = {
  id: string;
  userId: string;
  orderId: string | null;
  productCategory: string;
  templateId: string | null;
  previewSlug: string | null;
  previewPath: string | null;
  setupStatus: string;
  onboardingStep: number;
  businessSettings: Record<string, unknown> | null;
  socialSettings: Record<string, unknown> | null;
  gmailConnectedAt: string | null;
  dbMigrationNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapProject(row: {
  id: string;
  userId: string;
  orderId: string | null;
  productCategory: string;
  templateId: string | null;
  previewSlug: string | null;
  setupStatus: string;
  onboardingStep: number;
  businessSettings: unknown;
  socialSettings: unknown;
  gmailConnectedAt: Date | null;
  dbMigrationNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): TenantProjectDto {
  const template =
    row.templateId && row.productCategory
      ? getTemplateForOnboarding(row.productCategory, row.templateId)
      : undefined;

  return {
    id: row.id,
    userId: row.userId,
    orderId: row.orderId,
    productCategory: row.productCategory,
    templateId: row.templateId,
    previewSlug: row.previewSlug,
    previewPath: template
      ? resolveTemplatePreviewUrl(template)
      : row.previewSlug
        ? resolvePreviewPathBySlug(row.previewSlug, `/preview/${row.previewSlug}`)
        : null,
    setupStatus: row.setupStatus,
    onboardingStep: row.onboardingStep,
    businessSettings:
      row.businessSettings && typeof row.businessSettings === "object"
        ? (row.businessSettings as Record<string, unknown>)
        : null,
    socialSettings:
      row.socialSettings && typeof row.socialSettings === "object"
        ? (row.socialSettings as Record<string, unknown>)
        : null,
    gmailConnectedAt: row.gmailConnectedAt?.toISOString() ?? null,
    dbMigrationNotes: row.dbMigrationNotes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getTenantProjectForUser(userId: string): Promise<TenantProjectDto | null> {
  const row = await prisma.tenantProject.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  return row ? mapProject(row) : null;
}

export async function getTenantProjectForOrder(
  orderId: string,
  userId?: string | null,
): Promise<TenantProjectDto | null> {
  const byOrder = await prisma.tenantProject.findFirst({
    where: { orderId },
    orderBy: { updatedAt: "desc" },
  });
  if (byOrder) return mapProject(byOrder);

  if (userId) {
    return getTenantProjectForUser(userId);
  }

  return null;
}

export async function getOrCreateTenantProjectForUser(
  userId: string,
  orderId?: string | null,
): Promise<TenantProjectDto> {
  const existing = await prisma.tenantProject.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  if (existing) return mapProject(existing);

  const created = await prisma.tenantProject.create({
    data: {
      userId,
      orderId: orderId ?? undefined,
      productCategory: "clothing",
      setupStatus: "draft",
      onboardingStep: 1,
    },
  });
  return mapProject(created);
}

export async function updateTenantProject(
  id: string,
  data: Prisma.TenantProjectUpdateInput,
): Promise<TenantProjectDto> {
  const updated = await prisma.tenantProject.update({ where: { id }, data });
  return mapProject(updated);
}

export async function listTenantProjects(): Promise<
  (TenantProjectDto & { user: { email: string; name: string | null } })[]
> {
  const rows = await prisma.tenantProject.findMany({
    include: { user: { select: { email: true, name: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map((row) => ({
    ...mapProject(row),
    user: { email: row.user.email, name: row.user.name },
  }));
}
