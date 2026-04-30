import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ANALYTICS_EVENT_TYPES,
  type AnalyticsAdminResponse,
  type AnalyticsEventPayload,
  type CtaAnalyticsStats,
  type DailyAnalyticsStats,
  type PageAnalyticsStats,
} from "@/lib/analytics/types";

const MAX_INGEST_BATCH_SIZE = 100;
type AnalyticsRow = {
  eventType: string;
  page: string;
  metadata: Prisma.JsonValue | null;
  sessionId: string | null;
  createdAt: Date;
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

export async function getAnalyticsAdminStats(from?: Date, to?: Date): Promise<AnalyticsAdminResponse> {
  const rows = await prisma.analyticsEvent.findMany({
    where: {
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
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

  const pageStats = buildPageStats(rows);
  const { stats: ctaStats, totalClicks } = buildCtaStats(rows);
  const dailyStats = buildDailyStats(rows);

  return { pageStats, ctaStats, totalClicks, dailyStats };
}

export { MAX_INGEST_BATCH_SIZE };
