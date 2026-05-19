import type { Service, ServiceOption, ServiceUpsell } from "@/lib/types";
import { resolveServiceSlug, services as fallbackServices } from "@/lib/data/services";
import { ADMIN_STRIPE_TEST_SERVICE_ID } from "@/lib/server/admin-stripe-test-order";
import { prisma } from "@/lib/prisma";

function omitInternalCatalogServices(list: Service[]): Service[] {
  return list.filter((s) => s.id !== ADMIN_STRIPE_TEST_SERVICE_ID);
}

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

/** Prefer DB rows by id; fill gaps from static catalog; preserve catalog order. */
function mergeCatalogById<T extends { id: string }>(fromDb: T[], fallback: T[]): T[] {
  if (fromDb.length === 0) return fallback;
  const dbById = new Map(fromDb.map((row) => [row.id, row]));
  const merged: T[] = [];
  const seen = new Set<string>();

  for (const row of fallback) {
    merged.push(dbById.get(row.id) ?? row);
    seen.add(row.id);
  }

  for (const row of fromDb) {
    if (!seen.has(row.id)) merged.push(row);
  }

  return merged;
}

function mergeServiceWithFallback(fallback: Service, fromDb: Service): Service {
  return {
    ...fallback,
    ...fromDb,
    options: mergeCatalogById(fromDb.options, fallback.options),
    upsells: mergeCatalogById(fromDb.upsells, fallback.upsells),
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

  return dbServices.map((service) => ({
    id: service.id,
    slug: resolveServiceSlug(service.slug),
    name: service.name,
    description: service.fullDescription || service.shortDescription,
    icon: service.icon,
    basePrice: service.basePrice,
    isMonthly: service.isMonthly,
    options: service.options.map(mapOption),
    upsells: service.upsells.map(mapUpsell),
    features: service.features,
    timeline: service.timeline,
  }));
}

export async function getServices(): Promise<Service[]> {
  try {
    const dbServices = await fetchServicesFromDb();
    if (dbServices.length === 0) return omitInternalCatalogServices(fallbackServices);

    // If the DB is missing some catalog rows, still expose every known service so
    // /services/* pages and /api/services never 404 a known product.
    const byId = new Map(fallbackServices.map((s) => [s.id, s]));
    for (const s of dbServices) {
      const fallback = byId.get(s.id);
      byId.set(s.id, fallback ? mergeServiceWithFallback(fallback, s) : s);
    }
    return omitInternalCatalogServices(Array.from(byId.values()));
  } catch {
    return omitInternalCatalogServices(fallbackServices);
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
