export const ANALYTICS_EVENT_TYPES = [
  "page_view",
  "cta_click",
  "time_on_page",
  "scroll_depth",
] as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export type AnalyticsEventPayload = {
  eventType: AnalyticsEventType;
  page: string;
  metadata?: Record<string, unknown>;
  sessionId?: string;
  createdAt?: string;
};

export type QueuedAnalyticsEvent = AnalyticsEventPayload & {
  sessionId: string;
  createdAt: string;
};

export type PageAnalyticsStats = {
  page: string;
  views: number;
  uniqueSessions: number;
  ctaClicks: number;
  avgTimeOnPageSeconds: number;
  avgScrollDepthPercentage: number;
};

export type CtaAnalyticsStats = {
  page: string;
  ctaId: string;
  clicks: number;
  percentageOfTotal: number;
};

export type DailyAnalyticsStats = {
  date: string;
  visits: number;
};

export type AnalyticsAdminResponse = {
  pageStats: PageAnalyticsStats[];
  ctaStats: CtaAnalyticsStats[];
  totalClicks: number;
  dailyStats: DailyAnalyticsStats[];
  utmDailyStats: UtmDailyStats[];
  utmMonthlyStats: UtmMonthlyStats[];
  utmSources: UtmDimensionStats[];
  utmMediums: UtmDimensionStats[];
  utmCampaigns: UtmDimensionStats[];
  utmLandingUrls: UtmDimensionStats[];
  cartAdditions: {
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
};

export type UtmLandingEventPayload = {
  page: string;
  fullUrl: string;
  utmPayload: Record<string, string>;
  dedupeKey: string;
};

export type UtmDailyStats = {
  date: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  views: number;
};

export type UtmMonthlyStats = {
  month: string;
  views: number;
};

export type UtmDimensionStats = {
  key: string;
  views: number;
};
