/**
 * 3 безплатни съвета — настройки за изпращане на кампанията.
 *
 * Редактирай стойностите тук. Няма env променливи.
 *
 * Vercel Hobby: functionMaxDurationSeconds = 10, chunkSize = 1
 * Vercel Pro:   functionMaxDurationSeconds = 60, chunkSize = 8 (пример)
 *
 * Warmup: седмица 1 = 15/ден, после +10 всеки следващ седмица
 * (15, 25, 35, 45, …). Календарни дни от warmupStartDate, Europe/Sofia.
 */

export type TipsCampaignSendConfig = {
  /**
   * Must match `export const maxDuration = …` in
   * `app/api/admin/three-free-tips-campaign/send/route.ts`
   * (Next.js requires that export to be a static literal).
   * Hobby = 10, Pro = 60.
   */
  functionMaxDurationSeconds: number;
  /** Имейли на една API заявка. На Hobby остави 1. */
  chunkSize: number;
  /** Пауза между имейлите в една заявка (ms). При chunkSize = 1 не се ползва. */
  delayBetweenEmailsMs: number;
  /** Спри нови изпращания преди Vercel да убие функцията (ms). */
  timeBudgetMs: number;
  /** Колко дълго UI чака отговор от API (ms). Под function timeout. */
  fetchTimeoutMs: number;
  /**
   * Макс. имейли на един клик. 0 = без лимит — браузърът върти заявки
   * докато remainingEligible стане 0 (или Gmail rate limit / дневен warmup лимит).
   */
  sessionCap: number;
  /** Пауза между API заявките в UI (ms) — основен Gmail throttle. */
  chunkPauseMs: number;
};

/** Начало на седмица 1 (YYYY-MM-DD, Europe/Sofia). */
export const tipsCampaignWarmupStartDate = "2026-09-08";

/** Дневен лимит в седмица 1. */
export const tipsCampaignWarmupBaseDailyLimit = 15;

/** Колко имейла се добавят към дневния лимит всяка следваща седмица. */
export const tipsCampaignWarmupWeeklyIncrement = 10;

export const tipsCampaignSendConfig: TipsCampaignSendConfig = {
  functionMaxDurationSeconds: 10,
  chunkSize: 1,
  delayBetweenEmailsMs: 0,
  timeBudgetMs: 7_500,
  fetchTimeoutMs: 8_500,
  sessionCap: 0,
  chunkPauseMs: 2_000,
};

export function getTipsCampaignSendConfig(): TipsCampaignSendConfig {
  return tipsCampaignSendConfig;
}

function parseYmd(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y!, m! - 1, d!);
}

/** 0-базиран индекс на календарния ден от startDate (отрицателен преди старта). */
export function getTipsCampaignDayIndex(
  todayYmd: string,
  startYmd = tipsCampaignWarmupStartDate,
): number {
  const start = parseYmd(startYmd);
  const today = parseYmd(todayYmd);
  return Math.floor((today - start) / 86_400_000);
}

/** 1-базирана седмица от warmupStartDate (календарни дни / 7). 0 преди старта. */
export function getTipsCampaignWarmupWeek(
  todayYmd: string,
  startYmd = tipsCampaignWarmupStartDate,
): number {
  const dayIndex = getTipsCampaignDayIndex(todayYmd, startYmd);
  if (dayIndex < 0) return 0;
  return Math.floor(dayIndex / 7) + 1;
}

/** Дневен лимит: base + (week - 1) * increment. 0 преди старта. */
export function getTipsCampaignDailyLimit(week: number): number {
  if (week <= 0) return 0;
  const safeWeek = Math.max(week, 1);
  return (
    tipsCampaignWarmupBaseDailyLimit +
    (safeWeek - 1) * tipsCampaignWarmupWeeklyIncrement
  );
}

export type TipsCampaignWarmupInfo = {
  week: number;
  dailyLimit: number;
  startDate: string;
  baseDailyLimit: number;
  weeklyIncrement: number;
  /** 1-базиран ден от старта. 0 преди startDate. */
  campaignDay: number;
  /** Дни до startDate. 0 на или след старта. */
  daysUntilStart: number;
  started: boolean;
};

export function getTipsCampaignWarmupInfo(todayYmd: string): TipsCampaignWarmupInfo {
  const dayIndex = getTipsCampaignDayIndex(todayYmd);
  const week = getTipsCampaignWarmupWeek(todayYmd);
  return {
    week,
    dailyLimit: getTipsCampaignDailyLimit(week),
    startDate: tipsCampaignWarmupStartDate,
    baseDailyLimit: tipsCampaignWarmupBaseDailyLimit,
    weeklyIncrement: tipsCampaignWarmupWeeklyIncrement,
    campaignDay: dayIndex >= 0 ? dayIndex + 1 : 0,
    daysUntilStart: dayIndex < 0 ? -dayIndex : 0,
    started: dayIndex >= 0,
  };
}

/** Приблизителни секунди за една партида (за текста в admin). */
export function estimateChunkDurationSeconds(
  chunkSize = tipsCampaignSendConfig.chunkSize,
  delayMs = tipsCampaignSendConfig.delayBetweenEmailsMs,
): number {
  return Math.ceil((chunkSize * delayMs) / 1000 + 6);
}

export function isGmailRateLimitError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("rate limit") ||
    normalized.includes("rate-limit") ||
    normalized.includes("quota") ||
    normalized.includes("too many") ||
    normalized.includes("user-rate") ||
    normalized.includes("daily limit") ||
    normalized.includes("421") ||
    normalized.includes("429")
  );
}
