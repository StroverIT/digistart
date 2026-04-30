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
};
