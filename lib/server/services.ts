import type { Service, ServiceOption, ServiceUpsell } from "@/lib/types";
import { resolveServiceSlug, services as fallbackServices } from "@/lib/data/services";
import { prisma } from "@/lib/prisma";

function mapUpsell(upsell: {
  upsellKey: string;
  name: string;
  description: string;
  kind: string | null;
  unit: string | null;
  pricePerUnit: number | null;
  isMonthly: boolean;
  min: number | null;
  max: number | null;
  defaultValue: number | null;
  helperText: string | null;
  includedUnits: number | null;
  tierStep: number | null;
  tierPrice: number | null;
  allowEntries: boolean;
  entryLabel: string | null;
  entryPlaceholder: string | null;
  choices: unknown;
}): ServiceUpsell {
  return {
    id: upsell.upsellKey,
    name: upsell.name,
    description: upsell.description,
    kind: (upsell.kind as ServiceUpsell["kind"]) ?? undefined,
    unit: upsell.unit ?? undefined,
    pricePerUnit: upsell.pricePerUnit ?? undefined,
    isMonthly: upsell.isMonthly,
    min: upsell.min ?? undefined,
    max: upsell.max ?? undefined,
    default: upsell.defaultValue ?? undefined,
    helperText: upsell.helperText ?? undefined,
    includedUnits: upsell.includedUnits ?? undefined,
    tierStep: upsell.tierStep ?? undefined,
    tierPrice: upsell.tierPrice ?? undefined,
    allowEntries: upsell.allowEntries,
    entryLabel: upsell.entryLabel ?? undefined,
    entryPlaceholder: upsell.entryPlaceholder ?? undefined,
    choices: Array.isArray(upsell.choices) ? (upsell.choices as ServiceUpsell["choices"]) : undefined,
  };
}

function mapOption(option: {
  optionKey: string;
  name: string;
  description: string;
  price: number;
  isMonthly: boolean;
}): ServiceOption {
  return {
    id: option.optionKey,
    name: option.name,
    description: option.description,
    price: option.price,
    isMonthly: option.isMonthly,
  };
}

async function fetchServicesFromDb(): Promise<Service[]> {
  const dbServices = await prisma.service.findMany({
    include: {
      options: true,
      upsells: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return dbServices.map((service) => {
    const fromDb: Service = {
      id: service.id,
      slug: resolveServiceSlug(service.slug),
      name: service.name,
      shortDescription: service.shortDescription,
      fullDescription: service.fullDescription,
      icon: service.icon,
      basePrice: service.basePrice,
      isMonthly: service.isMonthly,
      options: service.options.map(mapOption),
      upsells: service.upsells.map(mapUpsell),
      features: service.features,
      timeline: service.timeline,
    };
    // If Prisma has no upsell rows yet, keep catalog upsells from lib/data so UI and pricing stay in sync.
    const fallback = fallbackServices.find((f) => f.id === service.id);
    if (fromDb.upsells.length === 0 && fallback && fallback.upsells.length > 0) {
      fromDb.upsells = fallback.upsells;
    }
    return fromDb;
  });
}

export async function getServices(): Promise<Service[]> {
  try {
    const dbServices = await fetchServicesFromDb();
    if (dbServices.length === 0) return fallbackServices;

    // If the DB is only partially seeded, still expose every catalog service so
    // /services/* pages and /api/services never 404 a known product.
    const byId = new Map(fallbackServices.map((s) => [s.id, s]));
    for (const s of dbServices) {
      byId.set(s.id, s);
    }
    return Array.from(byId.values());
  } catch {
    return fallbackServices;
  }
}

export async function getServiceByIdFromDb(id: string): Promise<Service | undefined> {
  const all = await getServices();
  return all.find((service) => service.id === id);
}

export async function getServiceBySlugFromDb(slug: string): Promise<Service | undefined> {
  const all = await getServices();
  const canonical = resolveServiceSlug(slug);
  return all.find((service) => service.slug === canonical);
}
