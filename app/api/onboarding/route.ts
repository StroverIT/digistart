import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getTemplate } from "@/lib/data/templates";
import {
  getOnboardingRequirements,
  type OnboardingRequirements,
} from "@/lib/onboarding/requirements";
import {
  getOrCreateTenantProjectForUser,
  getTenantProjectForUser,
  updateTenantProject,
} from "@/lib/server/tenant-projects";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  step: z.number().int().min(1).max(4).optional(),
  productCategory: z.enum(["clothing"]).optional(),
  templateId: z.string().optional(),
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

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orderItemId = req.nextUrl.searchParams.get("orderItemId");

  const project =
    (await getTenantProjectForUser(session.user.id)) ??
    (await getOrCreateTenantProjectForUser(session.user.id));

  const requirements = await loadRequirementsForUser(session.user.id, orderItemId);

  return NextResponse.json({ project, requirements });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  let project = await getOrCreateTenantProjectForUser(session.user.id);

  const category = parsed.data.productCategory ?? project.productCategory;

  let previewSlug: string | undefined;
  if (parsed.data.templateId && category) {
    const template = getTemplate(category, parsed.data.templateId);
    if (template) {
      previewSlug = `${category}/${template.id}`;
    }
  }

  project = await updateTenantProject(project.id, {
    ...(parsed.data.step != null ? { onboardingStep: parsed.data.step } : {}),
    ...(parsed.data.productCategory ? { productCategory: parsed.data.productCategory } : {}),
    ...(parsed.data.templateId ? { templateId: parsed.data.templateId } : {}),
    ...(previewSlug ? { previewSlug } : {}),
    ...(parsed.data.businessSettings != null
      ? { businessSettings: parsed.data.businessSettings as Prisma.InputJsonValue }
      : {}),
    ...(parsed.data.socialSettings != null
      ? { socialSettings: parsed.data.socialSettings as Prisma.InputJsonValue }
      : {}),
    ...(parsed.data.setupStatus ? { setupStatus: parsed.data.setupStatus } : {}),
    ...(parsed.data.step === 4 ? { setupStatus: "in_progress" } : {}),
  });

  return NextResponse.json({ project });
}
