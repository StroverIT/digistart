import { getTemplate } from "@/lib/data/templates";
import { getOrCreateTenantProjectForUser, updateTenantProject } from "@/lib/server/tenant-projects";
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

  const project = await getOrCreateTenantProjectForUser(userId, orderId);
  await updateTenantProject(project.id, {
    productCategory: template.category,
    templateId: template.id,
    previewSlug: `${template.category}/${template.id}`,
  });
}
