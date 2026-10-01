import type { Prisma } from "@prisma/client";
import type { MetaAttribution } from "@/lib/analytics/source";
import type {
  MetaAdsDailyStat,
  MetaAdsDimensionStat,
  MetaAdsRowStat,
  MetaAdsTrafficAggregate,
} from "@/lib/analytics/types";

type LandingRow = {
  createdAt: Date;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmPayload: Prisma.JsonValue;
};

type RegistrationRow = {
  createdAt: Date;
  attribution: MetaAttribution | null;
};

const UNKNOWN_CAMPAIGN = "(без кампания)";
const UNKNOWN_ADSET = "(без ad set)";
const UNKNOWN_CREATIVE = "(без creative)";

function asRecord(payload: Prisma.JsonValue): Record<string, string> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    if (typeof value === "string" && value.trim()) out[key] = value.trim();
  }
  return out;
}

function readField(
  payload: Record<string, string>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = payload[key];
    if (value?.trim()) return value.trim();
  }
  return null;
}

/**
 * Only count landings marked as paid Meta traffic with hierarchy params.
 * Bio short links (utm_medium=social, no utm_type=paid) are excluded.
 */
export function isMetaAdsTrafficPayload(input: {
  utmSource?: string | null;
  utmMedium?: string | null;
  payload: Record<string, string>;
}): boolean {
  const utmType = (input.payload.utm_type ?? "").toLowerCase();
  if (utmType !== "paid") return false;

  return Boolean(
    input.payload.campaign || input.payload.adset || input.payload.creative,
  );
}

function resolveHierarchy(payload: Record<string, string>, fallbackCampaign?: string | null) {
  const campaign =
    readField(payload, "campaign", "utm_campaign") ??
    fallbackCampaign?.trim() ??
    UNKNOWN_CAMPAIGN;
  const adset = readField(payload, "adset", "utm_term") ?? UNKNOWN_ADSET;
  const creative = readField(payload, "creative", "utm_content") ?? UNKNOWN_CREATIVE;

  return {
    campaign,
    adset,
    creative,
    campaignId: null as string | null,
    adsetId: null as string | null,
    adId: null as string | null,
  };
}

function rowKey(campaign: string, adset: string, creative: string) {
  return `${campaign}::${adset}::${creative}`;
}

function bumpDimension(
  map: Map<string, { views: number; registrations: number }>,
  key: string,
  field: "views" | "registrations",
) {
  const current = map.get(key) ?? { views: 0, registrations: 0 };
  current[field] += 1;
  map.set(key, current);
}

function toDimensionStats(
  map: Map<string, { views: number; registrations: number }>,
): MetaAdsDimensionStat[] {
  return Array.from(map.entries())
    .map(([key, counts]) => ({
      key,
      label: key,
      views: counts.views,
      registrations: counts.registrations,
      conversionRate:
        counts.views > 0
          ? Math.round((counts.registrations / counts.views) * 10_000) / 100
          : counts.registrations > 0
            ? 100
            : 0,
    }))
    .sort((a, b) => b.views - a.views || b.registrations - a.registrations);
}

export function buildEmptyMetaAdsTraffic(): MetaAdsTrafficAggregate {
  return {
    totalViews: 0,
    totalRegistrations: 0,
    conversionRate: 0,
    byCampaign: [],
    byAdset: [],
    byCreative: [],
    rows: [],
    daily: [],
  };
}

export function buildMetaAdsTrafficStats(
  landingRows: LandingRow[],
  registrationRows: RegistrationRow[],
): MetaAdsTrafficAggregate {
  const campaigns = new Map<string, { views: number; registrations: number }>();
  const adsets = new Map<string, { views: number; registrations: number }>();
  const creatives = new Map<string, { views: number; registrations: number }>();
  const rows = new Map<
    string,
    MetaAdsRowStat & { _views: number; _regs: number }
  >();
  const daily = new Map<string, { views: number; registrations: number }>();

  const touchRow = (
    hierarchy: ReturnType<typeof resolveHierarchy>,
    field: "views" | "registrations",
    dateKey: string,
  ) => {
    bumpDimension(campaigns, hierarchy.campaign, field);
    bumpDimension(adsets, hierarchy.adset, field);
    bumpDimension(creatives, hierarchy.creative, field);

    const key = rowKey(hierarchy.campaign, hierarchy.adset, hierarchy.creative);
    const existing =
      rows.get(key) ??
      ({
        key,
        campaign: hierarchy.campaign,
        adset: hierarchy.adset,
        creative: hierarchy.creative,
        campaignId: hierarchy.campaignId,
        adsetId: hierarchy.adsetId,
        adId: hierarchy.adId,
        views: 0,
        registrations: 0,
        conversionRate: 0,
        _views: 0,
        _regs: 0,
      } satisfies MetaAdsRowStat & { _views: number; _regs: number });

    if (field === "views") existing._views += 1;
    else existing._regs += 1;
    rows.set(key, existing);

    const day = daily.get(dateKey) ?? { views: 0, registrations: 0 };
    day[field] += 1;
    daily.set(dateKey, day);
  };

  for (const landing of landingRows) {
    const payload = asRecord(landing.utmPayload);
    if (
      !isMetaAdsTrafficPayload({
        utmSource: landing.utmSource,
        utmMedium: landing.utmMedium,
        payload,
      })
    ) {
      continue;
    }
    const hierarchy = resolveHierarchy(payload, landing.utmCampaign);
    const dateKey = landing.createdAt.toISOString().split("T")[0];
    touchRow(hierarchy, "views", dateKey);
  }

  for (const registration of registrationRows) {
    if (!registration.attribution) continue;
    const payload: Record<string, string> = {};
    for (const [key, value] of Object.entries(registration.attribution)) {
      if (typeof value === "string" && value.trim()) payload[key] = value.trim();
    }
    if (
      !isMetaAdsTrafficPayload({
        utmSource: payload.utm_source,
        utmMedium: payload.utm_medium,
        payload,
      })
    ) {
      continue;
    }

    const hierarchy = resolveHierarchy(payload, payload.utm_campaign);
    const dateKey = registration.createdAt.toISOString().split("T")[0];
    touchRow(hierarchy, "registrations", dateKey);
  }

  const rowStats: MetaAdsRowStat[] = Array.from(rows.values())
    .map((row) => {
      const views = row._views;
      const registrations = row._regs;
      return {
        key: row.key,
        campaign: row.campaign,
        adset: row.adset,
        creative: row.creative,
        campaignId: row.campaignId,
        adsetId: row.adsetId,
        adId: row.adId,
        views,
        registrations,
        conversionRate:
          views > 0
            ? Math.round((registrations / views) * 10_000) / 100
            : registrations > 0
              ? 100
              : 0,
      };
    })
    .sort((a, b) => b.views - a.views || b.registrations - a.registrations);

  const totalViews = rowStats.reduce((sum, row) => sum + row.views, 0);
  const totalRegistrations = rowStats.reduce((sum, row) => sum + row.registrations, 0);

  const dailyStats: MetaAdsDailyStat[] = Array.from(daily.entries())
    .map(([date, counts]) => ({
      date,
      views: counts.views,
      registrations: counts.registrations,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalViews,
    totalRegistrations,
    conversionRate:
      totalViews > 0
        ? Math.round((totalRegistrations / totalViews) * 10_000) / 100
        : totalRegistrations > 0
          ? 100
          : 0,
    byCampaign: toDimensionStats(campaigns),
    byAdset: toDimensionStats(adsets),
    byCreative: toDimensionStats(creatives),
    rows: rowStats,
    daily: dailyStats,
  };
}

export function attributionFromNewsletterMetadata(
  metadata: Prisma.JsonValue | null | undefined,
): MetaAttribution | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const raw = (metadata as Record<string, unknown>).attribution;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

  const attribution: MetaAttribution = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "string" && value.trim()) {
      (attribution as Record<string, string>)[key] = value.trim();
    }
  }
  return Object.keys(attribution).length > 0 ? attribution : null;
}
