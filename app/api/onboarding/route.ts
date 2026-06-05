import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  getOnboardingRequirements,
  applyProjectToRequirements,
  type OnboardingRequirements,
} from "@/lib/onboarding/requirements";
import {
  getOrCreateTenantProjectForOrder,
  getOrCreateTenantProjectForUser,
  getTenantProjectForOrder,
  getTenantProjectForUser,
  updateTenantProject,
} from "@/lib/server/tenant-projects";
import { parseSelectedTemplateIds } from "@/lib/onboarding/selected-templates";
import {
  deriveSetupStepsFromProject,
  mergeStepsCompletedForSave,
  parseOnboardingStepsCompleted,
} from "@/lib/onboarding/setup-steps";
import { prisma } from "@/lib/prisma";
import type { TenantProjectDto } from "@/lib/server/tenant-projects";

const patchSchema = z.object({
  step: z.number().int().min(1).max(4).optional(),
  productCategory: z.enum(["clothing", "cosmetics", "food", "other"]).optional(),
  templateId: z.string().nullish(),
  businessSettings: z.record(z.unknown()).optional(),
  socialSettings: z.record(z.unknown()).optional(),
  setupStatus: z.enum(["draft", "in_progress", "live"]).optional(),
});

async function loadRequirementsForUser(
  userId: string,
  orderItemId: string | null,
): Promise<OnboardingRequirements> {
  if (orderItemId) {
    const item = await prisma.orderItem.findFirst({
      where: { id: orderItemId, order: { userId } },
      include: { order: { include: { items: true } } },
    });
    if (item?.order) {
      return getOnboardingRequirements(
        item.order.items.map((row) => ({
          serviceId: row.serviceId,
          upsells: row.upsells,
        })),
      );
    }
  }

  const project = await getTenantProjectForUser(userId);
  if (project?.orderId) {
    const order = await prisma.order.findFirst({
      where: { id: project.orderId, userId },
      include: { items: true },
    });
    if (order) {
      return getOnboardingRequirements(
        order.items.map((row) => ({
          serviceId: row.serviceId,
          upsells: row.upsells,
        })),
      );
    }
  }

  const latestOrder = await prisma.order.findFirst({
    where: { userId, status: { in: ["paid", "in_progress", "completed"] } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  if (latestOrder) {
    return getOnboardingRequirements(
      latestOrder.items.map((row) => ({
        serviceId: row.serviceId,
        upsells: row.upsells,
      })),
    );
  }

  return getOnboardingRequirements([{ serviceId: "ready-store", upsells: [] }]);
}

async function resolveOrderIdFromOrderItem(
  userId: string,
  orderItemId: string | null,
): Promise<string | null> {
  if (!orderItemId) return null;
  const item = await prisma.orderItem.findFirst({
    where: { id: orderItemId, order: { userId } },
    select: { orderId: true },
  });
  return item?.orderId ?? null;
}

async function resolveProjectForOnboarding(
  userId: string,
  orderItemId: string | null,
): Promise<TenantProjectDto> {
  const orderId = await resolveOrderIdFromOrderItem(userId, orderItemId);
  if (orderId) {
    const existing = await getTenantProjectForOrder(orderId, userId, { fallbackToLatest: false });
    if (existing) return existing;
    return getOrCreateTenantProjectForOrder(userId, orderId);
  }

  return (
    (await getTenantProjectForUser(userId)) ??
    (await getOrCreateTenantProjectForUser(userId))
  );
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orderItemId = req.nextUrl.searchParams.get("orderItemId");

  const project = await resolveProjectForOnboarding(session.user.id, orderItemId);

  const requirements = applyProjectToRequirements(
    await loadRequirementsForUser(session.user.id, orderItemId),
    project,
  );

  return NextResponse.json({ project, requirements });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orderItemId = req.nextUrl.searchParams.get("orderItemId");

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  let project = await resolveProjectForOnboarding(session.user.id, orderItemId);

  const category = project.productCategory || "clothing";
  const incomingBusinessSettings = parsed.data.businessSettings as
    | Record<string, unknown>
    | undefined;
  const selectedTemplateIds = parseSelectedTemplateIds(
    incomingBusinessSettings ?? project.businessSettings,
    parsed.data.templateId ?? project.templateId,
  );
  const primaryTemplateId = selectedTemplateIds[0] ?? parsed.data.templateId;

  const mergedForSteps: TenantProjectDto = {
    ...project,
    onboardingStep: parsed.data.step ?? project.onboardingStep,
    templateId: primaryTemplateId ?? project.templateId,
    productCategory: primaryTemplateId ? category : project.productCategory,
    businessSettings:
      parsed.data.businessSettings != null
        ? (parsed.data.businessSettings as Record<string, unknown>)
        : project.businessSettings,
    socialSettings:
      parsed.data.socialSettings != null
        ? (parsed.data.socialSettings as Record<string, unknown>)
        : project.socialSettings,
    setupStatus: parsed.data.setupStatus ?? project.setupStatus,
  };

  const requirements = applyProjectToRequirements(
    await loadRequirementsForUser(session.user.id, orderItemId),
    mergedForSteps,
  );
  const derivedSteps = deriveSetupStepsFromProject(mergedForSteps, requirements);
  const onboardingStepsCompleted = mergeStepsCompletedForSave(
    parseOnboardingStepsCompleted(project.onboardingStepsCompleted),
    derivedSteps,
  );

  project = await updateTenantProject(project.id, {
    ...(parsed.data.step != null ? { onboardingStep: parsed.data.step } : {}),
    ...(primaryTemplateId
      ? { templateId: primaryTemplateId, productCategory: category }
      : {}),
    ...(parsed.data.businessSettings != null
      ? { businessSettings: parsed.data.businessSettings as Prisma.InputJsonValue }
      : {}),
    ...(parsed.data.socialSettings != null
      ? { socialSettings: parsed.data.socialSettings as Prisma.InputJsonValue }
      : {}),
    ...(parsed.data.setupStatus ? { setupStatus: parsed.data.setupStatus } : {}),
    onboardingStepsCompleted: onboardingStepsCompleted as Prisma.InputJsonValue,
  });

  return NextResponse.json({ project });
}
