/**
 * Ensures Service rows exist in Postgres for FKs and slot management.
 * Catalog pricing and options live only in lib/data/services.ts.
 * Run: npx tsx scripts/sync-services-catalog.ts
 */
import "dotenv/config";
import { subscriptionPlans, planToServiceId } from "../lib/data/plans";
import { services } from "../lib/data/services";
import { prisma } from "../lib/prisma";

async function syncServiceRow(service: (typeof services)[number]) {
  await prisma.service.upsert({
    where: { id: service.id },
    create: {
      id: service.id,
      slug: service.slug,
      name: service.name,
      shortDescription: service.description,
      fullDescription: service.description,
      icon: service.icon,
      basePrice: Math.round(service.basePrice),
      isMonthly: service.isMonthly ?? false,
      timeline: service.timeline,
      features: service.features,
      slotCapacity: 20,
    },
    update: {
      slug: service.slug,
      name: service.name,
      shortDescription: service.description,
      fullDescription: service.description,
      icon: service.icon,
      basePrice: Math.round(service.basePrice),
      isMonthly: service.isMonthly ?? false,
      timeline: service.timeline,
      features: service.features,
    },
  });
}

async function main() {
  for (const service of services) {
    await syncServiceRow(service);
    console.log(`Synced service row: ${service.id}`);
  }

  for (const plan of subscriptionPlans) {
    const serviceId = planToServiceId(plan.id);
    await prisma.service.upsert({
      where: { id: serviceId },
      create: {
        id: serviceId,
        slug: `plan-${plan.id}`,
        name: `Пакет ${plan.name}`,
        shortDescription: plan.tagline,
        fullDescription: plan.description,
        icon: "Package",
        basePrice: Math.round(plan.monthlyTotal),
        isMonthly: true,
        timeline: "Абонаментен пакет",
        features: plan.features,
        slotCapacity: 20,
      },
      update: {
        name: `Пакет ${plan.name}`,
        basePrice: Math.round(plan.monthlyTotal),
        shortDescription: plan.tagline,
        fullDescription: plan.description,
        features: plan.features,
      },
    });
    console.log(`Synced bundle plan row: ${plan.id}`);
  }

  console.log("Service row sync complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
