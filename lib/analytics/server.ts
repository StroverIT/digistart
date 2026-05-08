import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ANALYTICS_EVENT_TYPES,
  type AnalyticsAdminResponse,
  type AnalyticsEventPayload,
  type CtaAnalyticsStats,
  type DailyAnalyticsStats,
  type PageAnalyticsStats,
  type UtmDimensionStats,
  type UtmDailyStats,
  type UtmLandingEventPayload,
  type UtmMonthlyStats,
} from "@/lib/analytics/types";

const MAX_INGEST_BATCH_SIZE = 100;
type AnalyticsRow = {
  eventType: string;
  page: string;
  metadata: Prisma.JsonValue | null;
  sessionId: string | null;
  createdAt: Date;
};

type CartAdditionAggregate = {
  allTimeTotalAdds: number;
  lastDaysTotalAdds: number;
  dailyTotals: { date: string; totalAdds: number }[];
  dailyByCombo: { date: string; comboKey: string; count: number }[];
  byService: { serviceId: string; serviceName: string; count: number }[];
  byCombo: {
    comboKey: string;
    serviceId: string;
    serviceName: string;
    comboLabel: string;
    count: number;
  }[];
};

export function isValidAnalyticsBatch(events: unknown): events is AnalyticsEventPayload[] {
  if (!Array.isArray(events) || events.length === 0 || events.length > MAX_INGEST_BATCH_SIZE) {
    return false;
  }

  return events.every(
    (event) =>
      event &&
      typeof event === "object" &&
      "eventType" in event &&
      "page" in event &&
      ANALYTICS_EVENT_TYPES.includes((event as AnalyticsEventPayload).eventType) &&
      typeof (event as AnalyticsEventPayload).page === "string",
  );
}

export async function storeAnalyticsEvents(events: AnalyticsEventPayload[]) {
  const validEvents = events
    .filter((event) => event.page.length > 0 && event.page.length <= 500)
    .map((event) => ({
      eventType: event.eventType,
      page: event.page,
      metadata: (event.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      sessionId: typeof event.sessionId === "string" ? event.sessionId : null,
      createdAt: event.createdAt ? new Date(event.createdAt) : new Date(),
    }));

  if (validEvents.length === 0) return 0;

  const result = await prisma.analyticsEvent.createMany({ data: validEvents });
  return result.count;
}

export async function storeUtmLandingEvent(event: UtmLandingEventPayload) {
  const payload = event.utmPayload;
  if (!event.page || !event.dedupeKey || Object.keys(payload).length === 0) {
    return { inserted: false };
  }

  const utmSource = typeof payload.utm_source === "string" ? payload.utm_source : null;
  const utmMedium = typeof payload.utm_medium === "string" ? payload.utm_medium : null;
  const utmCampaign = typeof payload.utm_campaign === "string" ? payload.utm_campaign : null;

  try {
    const insertedCount = await prisma.$executeRaw`
      INSERT INTO "utm_landing_events"
        ("id", "page", "landing_url", "utm_source", "utm_medium", "utm_campaign", "utm_payload", "dedupe_key", "created_at", "updated_at")
      VALUES
        (${crypto.randomUUID()}, ${event.page}, ${event.fullUrl}, ${utmSource}, ${utmMedium}, ${utmCampaign}, ${JSON.stringify(payload)}::jsonb, ${event.dedupeKey}, NOW(), NOW())
      ON CONFLICT ("dedupe_key") DO NOTHING
    `;

    return { inserted: insertedCount > 0 };
  } catch (error) {
    throw error;
  }
}

function buildPageStats(rows: AnalyticsRow[]): PageAnalyticsStats[] {
  const byPage = new Map<
    string,
    {
      views: number;
      sessions: Set<string>;
      ctaClicks: number;
      totalTime: number;
      timeCount: number;
      scrollMaxPerSession: Map<string, number>;
    }
  >();

  for (const row of rows) {
    const current =
      byPage.get(row.page) ??
      {
        views: 0,
        sessions: new Set<string>(),
        ctaClicks: 0,
        totalTime: 0,
        timeCount: 0,
        scrollMaxPerSession: new Map<string, number>(),
      };

    if (row.eventType === "page_view") {
      current.views += 1;
      if (row.sessionId) current.sessions.add(row.sessionId);
    }

    if (row.eventType === "cta_click") {
      current.ctaClicks += 1;
    }

    if (row.eventType === "time_on_page") {
      const duration = Number((row.metadata as Record<string, unknown> | null)?.duration_seconds ?? 0);
      if (Number.isFinite(duration) && duration > 0) {
        current.totalTime += duration;
        current.timeCount += 1;
      }
    }

    if (row.eventType === "scroll_depth") {
      const session = row.sessionId ?? "anon";
      const scroll = Number(
        (row.metadata as Record<string, unknown> | null)?.scroll_percentage ?? 0,
      );
      if (Number.isFinite(scroll)) {
        const previous = current.scrollMaxPerSession.get(session) ?? 0;
        current.scrollMaxPerSession.set(session, Math.max(previous, scroll));
      }
    }

    byPage.set(row.page, current);
  }

  return Array.from(byPage.entries())
    .map(([page, stats]) => {
      const scrollValues = Array.from(stats.scrollMaxPerSession.values());
      const avgScroll =
        scrollValues.length > 0
          ? scrollValues.reduce((sum, value) => sum + value, 0) / scrollValues.length
          : 0;
      return {
        page,
        views: stats.views,
        uniqueSessions: stats.sessions.size,
        ctaClicks: stats.ctaClicks,
        avgTimeOnPageSeconds: stats.timeCount > 0 ? stats.totalTime / stats.timeCount : 0,
        avgScrollDepthPercentage: avgScroll,
      };
    })
    .sort((a, b) => b.views - a.views);
}

function buildCtaStats(rows: AnalyticsRow[]): {
  stats: CtaAnalyticsStats[];
  totalClicks: number;
} {
  const counts = new Map<string, number>();
  let totalClicks = 0;

  for (const row of rows) {
    if (row.eventType !== "cta_click") continue;
    const ctaId = String((row.metadata as Record<string, unknown> | null)?.cta_id ?? "");
    if (!ctaId) continue;
    totalClicks += 1;
    const key = `${row.page}::${ctaId}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const stats: CtaAnalyticsStats[] = Array.from(counts.entries())
    .map(([key, clicks]) => {
      const [page, ctaId] = key.split("::");
      return {
        page,
        ctaId,
        clicks,
        percentageOfTotal:
          totalClicks > 0 ? Math.round((clicks / totalClicks) * 10_000) / 100 : 0,
      };
    })
    .sort((a, b) => b.clicks - a.clicks);

  return { stats, totalClicks };
}

function buildDailyStats(rows: AnalyticsRow[]): DailyAnalyticsStats[] {
  const visitsByDate = new Map<string, number>();
  for (const row of rows) {
    if (row.eventType !== "page_view") continue;
    const key = row.createdAt.toISOString().split("T")[0];
    visitsByDate.set(key, (visitsByDate.get(key) ?? 0) + 1);
  }

  return Array.from(visitsByDate.entries())
    .map(([date, visits]) => ({ date, visits }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildUtmDailyStats(
  rows: {
    createdAt: Date;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
  }[],
): UtmDailyStats[] {
  const byKey = new Map<string, UtmDailyStats>();
  for (const row of rows) {
    const date = row.createdAt.toISOString().split("T")[0];
    const utmSource = row.utmSource ?? "(not set)";
    const utmMedium = row.utmMedium ?? "(not set)";
    const utmCampaign = row.utmCampaign ?? "(not set)";
    const key = `${date}::${utmSource}::${utmMedium}::${utmCampaign}`;
    const current = byKey.get(key);
    if (current) {
      current.views += 1;
      continue;
    }
    byKey.set(key, { date, utmSource, utmMedium, utmCampaign, views: 1 });
  }

  return Array.from(byKey.values()).sort((a, b) => {
    if (a.date === b.date) return b.views - a.views;
    return a.date.localeCompare(b.date);
  });
}

function buildUtmMonthlyStats(
  rows: {
    createdAt: Date;
  }[],
): UtmMonthlyStats[] {
  const byMonth = new Map<string, number>();
  for (const row of rows) {
    const month = row.createdAt.toISOString().slice(0, 7);
    byMonth.set(month, (byMonth.get(month) ?? 0) + 1);
  }
  return Array.from(byMonth.entries())
    .map(([month, views]) => ({ month, views }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function buildUtmDimensionStats(
  rows: {
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    landingUrl: string;
  }[],
  key: "utmSource" | "utmMedium" | "utmCampaign" | "landingUrl",
): UtmDimensionStats[] {
  const byValue = new Map<string, number>();
  for (const row of rows) {
    const value = row[key] && row[key].trim().length > 0 ? row[key] : "(not set)";
    byValue.set(value, (byValue.get(value) ?? 0) + 1);
  }
  return Array.from(byValue.entries())
    .map(([item, views]) => ({ key: item, views }))
    .sort((a, b) => b.views - a.views);
}

function buildCartAdditionStats(rows: AnalyticsRow[], days = 30): CartAdditionAggregate {
  const cartRows = rows.filter((row) => row.eventType === "cart_addition");
  const dailyMap = new Map<string, number>();
  const dailyComboMap = new Map<string, number>();
  const byService = new Map<string, { serviceId: string; serviceName: string; count: number }>();
  const byCombo = new Map<
    string,
    {
      comboKey: string;
      serviceId: string;
      serviceName: string;
      comboLabel: string;
      count: number;
    }
  >();

  const now = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    dailyMap.set(day.toISOString().split("T")[0], 0);
  }

  for (const row of cartRows) {
    const metadata = (row.metadata ?? {}) as Record<string, unknown>;
    const rawServiceId = String(metadata.service_id ?? "").trim();
    const rawServiceName = String(metadata.service_name ?? "").trim();
    const rawComboKey = String(metadata.combo_key ?? "").trim();
    const rawComboLabel = String(metadata.combo_label ?? "").trim();
    const fallbackServiceName =
      rawServiceName ||
      (rawComboKey.includes("__") ? rawComboKey.split("__")[0] : "") ||
      "Unknown service";
    const serviceId = rawServiceId || `service:${fallbackServiceName.toLowerCase()}`;
    const serviceName = fallbackServiceName;
    const comboKey = rawComboKey || `${serviceId}__unknown`;
    const comboLabel =
      rawComboLabel ||
      (comboKey.endsWith("__none") ? "Без допълнителни услуги" : "Комбинация не е налична");

    const date = row.createdAt.toISOString().split("T")[0];
    if (dailyMap.has(date)) {
      dailyMap.set(date, (dailyMap.get(date) ?? 0) + 1);
      const dailyComboKey = `${date}::${comboKey}`;
      dailyComboMap.set(dailyComboKey, (dailyComboMap.get(dailyComboKey) ?? 0) + 1);
    }

    const existingService = byService.get(serviceId) ?? {
      serviceId,
      serviceName,
      count: 0,
    };
    existingService.count += 1;
    byService.set(serviceId, existingService);

    const existingCombo = byCombo.get(comboKey) ?? {
      comboKey,
      serviceId,
      serviceName,
      comboLabel,
      count: 0,
    };
    existingCombo.count += 1;
    byCombo.set(comboKey, existingCombo);
  }

  const dailyTotals = Array.from(dailyMap.entries()).map(([date, totalAdds]) => ({
    date,
    totalAdds,
  }));
  const dailyByCombo = Array.from(dailyComboMap.entries()).map(([key, count]) => {
    const [date, comboKey] = key.split("::");
    return { date, comboKey, count };
  });

  return {
    allTimeTotalAdds: cartRows.length,
    lastDaysTotalAdds: dailyTotals.reduce((sum, row) => sum + row.totalAdds, 0),
    dailyTotals,
    dailyByCombo,
    byService: Array.from(byService.values()).sort((a, b) => b.count - a.count),
    byCombo: Array.from(byCombo.values()).sort((a, b) => b.count - a.count),
  };
}

export async function getAnalyticsAdminStats(from?: Date, to?: Date): Promise<AnalyticsAdminResponse> {
  const createdAtFilter =
    from || to
      ? {
          createdAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {};

  const rows = await prisma.analyticsEvent.findMany({
    where: {
      ...createdAtFilter,
    },
    select: {
      eventType: true,
      page: true,
      metadata: true,
      sessionId: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const fromDate = from ?? null;
  const toDate = to ?? null;
  const utmRows = await prisma.$queryRaw<
    {
      createdAt: Date;
      utmSource: string | null;
      utmMedium: string | null;
      utmCampaign: string | null;
      landingUrl: string;
    }[]
  >`
    SELECT
      "created_at" AS "createdAt",
      "utm_source" AS "utmSource",
      "utm_medium" AS "utmMedium",
      "utm_campaign" AS "utmCampaign",
      "landing_url" AS "landingUrl"
    FROM "utm_landing_events"
    WHERE (${fromDate}::timestamp IS NULL OR "created_at" >= ${fromDate}::timestamp)
      AND (${toDate}::timestamp IS NULL OR "created_at" <= ${toDate}::timestamp)
    ORDER BY "created_at" DESC
  `;

  const pageStats = buildPageStats(rows);
  const { stats: ctaStats, totalClicks } = buildCtaStats(rows);
  const dailyStats = buildDailyStats(rows);
  const utmDailyStats = buildUtmDailyStats(utmRows);
  const utmMonthlyStats = buildUtmMonthlyStats(utmRows);
  const utmSources = buildUtmDimensionStats(utmRows, "utmSource");
  const utmMediums = buildUtmDimensionStats(utmRows, "utmMedium");
  const utmCampaigns = buildUtmDimensionStats(utmRows, "utmCampaign");
  const utmLandingUrls = buildUtmDimensionStats(utmRows, "landingUrl");
  const cartAdditions = buildCartAdditionStats(rows, 30);

  return {
    pageStats,
    ctaStats,
    totalClicks,
    dailyStats,
    utmDailyStats,
    utmMonthlyStats,
    utmSources,
    utmMediums,
    utmCampaigns,
    utmLandingUrls,
    cartAdditions,
  };
}

export { MAX_INGEST_BATCH_SIZE };
