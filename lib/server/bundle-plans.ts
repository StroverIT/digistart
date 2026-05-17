import { getPlanById, planToServiceId, serviceIdToPlanId } from "@/lib/data/plans";
import { prisma } from "@/lib/prisma";

/** Ensures bundle plan rows exist in Service table for OrderItem FK. */
export async function ensureBundlePlanServiceInDb(serviceId: string): Promise<boolean> {
  const planId = serviceIdToPlanId(serviceId);
  if (!planId) return false;

  const plan = getPlanById(planId);
  if (!plan) return false;

  const existing = await prisma.service.findUnique({ where: { id: serviceId } });
  if (existing) return true;

  await prisma.service.create({
    data: {
      id: serviceId,
      slug: `plan-${planId}`,
      name: `Пакет ${plan.name}`,
      shortDescription: plan.tagline,
      fullDescription: plan.description,
      icon: "Package",
      basePrice: Math.round(plan.monthlyTotal),
      isMonthly: true,
      timeline: "Абонаментен пакет",
      features: plan.features,
      options: {
        create: [
          {
            optionKey: planId,
            name: plan.name,
            description: plan.description,
            price: Math.round(plan.monthlyTotal),
            isMonthly: true,
          },
        ],
      },
    },
  });

  return true;
}

export function isBundlePlanServiceId(serviceId: string): boolean {
  return serviceIdToPlanId(serviceId) !== null;
}

export { planToServiceId, serviceIdToPlanId };
