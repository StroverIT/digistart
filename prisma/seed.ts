import { prisma } from "@/lib/prisma";
import { services } from "@/lib/data/services";

async function seedServices() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      create: {
        id: service.id,
        slug: service.slug,
        name: service.name,
        shortDescription: service.shortDescription,
        fullDescription: service.fullDescription,
        icon: service.icon,
        basePrice: service.basePrice,
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
        basePrice: service.basePrice,
        isMonthly: service.isMonthly ?? false,
        timeline: service.timeline,
        features: service.features,
      },
    });

    await prisma.serviceOption.deleteMany({ where: { serviceId: service.id } });
    await prisma.serviceUpsell.deleteMany({ where: { serviceId: service.id } });

    if (service.options.length > 0) {
      await prisma.serviceOption.createMany({
        data: service.options.map((option) => ({
          optionKey: option.id,
          name: option.name,
          description: option.description,
          price: option.price,
          isMonthly: option.isMonthly ?? false,
          serviceId: service.id,
        })),
      });
    }

    if (service.upsells.length > 0) {
      await prisma.serviceUpsell.createMany({
        data: service.upsells.map((upsell) => ({
          upsellKey: upsell.id,
          name: upsell.name,
          description: upsell.description,
          kind: upsell.kind,
          unit: upsell.unit,
          pricePerUnit: upsell.pricePerUnit,
          isMonthly: upsell.isMonthly ?? false,
          min: upsell.min,
          max: upsell.max,
          defaultValue: upsell.default,
          helperText: upsell.helperText,
          includedUnits: upsell.includedUnits,
          tierStep: upsell.tierStep,
          tierPrice: upsell.tierPrice,
          allowEntries: upsell.allowEntries ?? false,
          entryLabel: upsell.entryLabel,
          entryPlaceholder: upsell.entryPlaceholder,
          choices: upsell.choices ?? undefined,
          serviceId: service.id,
        })),
      });
    }
  }
}

async function main() {
  await seedServices();
  console.log(`Seeded ${services.length} services.`);
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
