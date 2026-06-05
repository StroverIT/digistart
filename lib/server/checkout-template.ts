import { getTemplate } from "@/lib/data/templates";
import type { Prisma } from "@prisma/client";
import { markSetupStepComplete, parseOnboardingStepsCompleted } from "@/lib/onboarding/setup-steps";
import {
  getOrCreateTenantProjectForOrder,
  getTenantProjectForOrder,
  updateTenantProject,
  type TenantProjectDto,
} from "@/lib/server/tenant-projects";
import { prisma } from "@/lib/prisma";

export async function applyCheckoutTemplateFromOrderMetadata(
  orderId: string,
  userId: string,
): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { stripeMetadata: true },
  });

  const metadata = order?.stripeMetadata;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return;

  const record = metadata as Record<string, unknown>;
  const templateCategory =
    typeof record.templateCategory === "string" ? record.templateCategory : null;
  const templateId = typeof record.templateId === "string" ? record.templateId : null;

  if (!templateCategory || !templateId) return;

  const template = getTemplate(templateCategory, templateId);
  if (!template) return;

  const project = await getOrCreateTenantProjectForOrder(userId, orderId);
  const stepsCompleted = markSetupStepComplete(
    parseOnboardingStepsCompleted(project.onboardingStepsCompleted),
    "template",
  );
  await updateTenantProject(project.id, {
    orderId,
    productCategory: template.category,
    templateId: template.id,
    onboardingStepsCompleted: stepsCompleted as Prisma.InputJsonValue,
  });
}

/** Returns the order-scoped project, creating it from checkout template metadata when needed. */
export async function ensureTenantProjectForOrder(
  orderId: string,
  userId: string,
): Promise<TenantProjectDto | null> {
  let existing = await getTenantProjectForOrder(orderId, userId, { fallbackToLatest: false });
  if (existing) {
    if (existing.templateId && !existing.onboardingStepsCompleted?.template) {
      existing = await updateTenantProject(existing.id, {
        onboardingStepsCompleted: markSetupStepComplete(
          parseOnboardingStepsCompleted(existing.onboardingStepsCompleted),
          "template",
        ) as Prisma.InputJsonValue,
      });
    }
    return existing;
  }

  await applyCheckoutTemplateFromOrderMetadata(orderId, userId);

  return getTenantProjectForOrder(orderId, userId, { fallbackToLatest: false });
}
