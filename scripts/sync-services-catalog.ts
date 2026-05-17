/**
 * Upserts Service, ServiceOption, and ServiceUpsell from lib/data/services.ts into Postgres.
 * Run: npx tsx scripts/sync-services-catalog.ts
 */
import { PrismaClient } from "@prisma/client";
import { subscriptionPlans, planToServiceId } from "../lib/data/plans";
import { services } from "../lib/data/services";

const prisma = new PrismaClient();

async function syncService(service: (typeof services)[number]) {
  await prisma.service.upsert({
    where: { id: service.id },
    create: {
      id: service.id,
      slug: service.slug,
      name: service.name,
      shortDescription: service.shortDescription,
      fullDescription: service.fullDescription,
      icon: service.icon,
      basePrice: Math.round(service.basePrice),
      isMonthly: service.isMonthly ?? false,
      timeline: service.timeline,
      features: service.features,
    },
    update: {
      slug: service.slug,
      name: service.name,
      shortDescription: service.shortDescription,
      fullDescription: service.fullDescription,
      icon: service.icon,
      basePrice: Math.round(service.basePrice),
      isMonthly: service.isMonthly ?? false,
      timeline: service.timeline,
      features: service.features,
    },
  });

  for (const option of service.options) {
    await prisma.serviceOption.upsert({
      where: {
        serviceId_optionKey: { serviceId: service.id, optionKey: option.id },
      },
      create: {
        serviceId: service.id,
        optionKey: option.id,
        name: option.name,
        description: option.description,
        price: Math.round(option.price),
        isMonthly: option.isMonthly ?? false,
      },
      update: {
        name: option.name,
        description: option.description,
        price: Math.round(option.price),
        isMonthly: option.isMonthly ?? false,
      },
    });
  }

  const upsellKeys = service.upsells.map((u) => u.id);
  await prisma.serviceUpsell.deleteMany({
    where: {
      serviceId: service.id,
      upsellKey: { notIn: upsellKeys },
    },
  });

  for (const upsell of service.upsells) {
    await prisma.serviceUpsell.upsert({
      where: {
        serviceId_upsellKey: { serviceId: service.id, upsellKey: upsell.id },
      },
      create: {
        serviceId: service.id,
        upsellKey: upsell.id,
        name: upsell.name,
        description: upsell.description,
        kind: upsell.kind ?? null,
        unit: upsell.unit ?? null,
        pricePerUnit: upsell.pricePerUnit != null ? Math.round(upsell.pricePerUnit * 100) / 100 : null,
        isMonthly: upsell.isMonthly ?? false,
        min: upsell.min ?? null,
        max: upsell.max ?? null,
        defaultValue: upsell.default ?? null,
        helperText: upsell.helperText ?? null,
        includedUnits: upsell.includedUnits ?? null,
        tierStep: upsell.tierStep ?? null,
        tierPrice: upsell.tierPrice ?? null,
        allowEntries: upsell.allowEntries ?? false,
        entryLabel: upsell.entryLabel ?? null,
        entryPlaceholder: upsell.entryPlaceholder ?? null,
        choices: upsell.choices ?? undefined,
      },
      update: {
        name: upsell.name,
        description: upsell.description,
        kind: upsell.kind ?? null,
        unit: upsell.unit ?? null,
        pricePerUnit: upsell.pricePerUnit != null ? Math.round(upsell.pricePerUnit * 100) / 100 : null,
        isMonthly: upsell.isMonthly ?? false,
        min: upsell.min ?? null,
        max: upsell.max ?? null,
        defaultValue: upsell.default ?? null,
        helperText: upsell.helperText ?? null,
        includedUnits: upsell.includedUnits ?? null,
        choices: upsell.choices ?? undefined,
      },
    });
  }
}

async function main() {
  for (const service of services) {
    await syncService(service);
    console.log(`Synced service: ${service.id}`);
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
        options: {
          create: [
            {
              optionKey: plan.id,
              name: plan.name,
              description: plan.description,
              price: Math.round(plan.monthlyTotal),
              isMonthly: true,
            },
          ],
        },
      },
      update: {
        name: `Пакет ${plan.name}`,
        basePrice: Math.round(plan.monthlyTotal),
        shortDescription: plan.tagline,
        fullDescription: plan.description,
        features: plan.features,
      },
    });
    console.log(`Synced bundle plan: ${plan.id}`);
  }

  console.log("Catalog sync complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
