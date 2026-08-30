/**
 * 3 безплатни съвета — настройки за изпращане на кампанията.
 *
 * Редактирай стойностите тук. Няма env променливи.
 *
 * Vercel Hobby: functionMaxDurationSeconds = 10, chunkSize = 1
 * Vercel Pro:   functionMaxDurationSeconds = 60, chunkSize = 8 (пример)
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
  /** Макс. имейли на един клик „Изпрати следваща партида“. */
  sessionCap: number;
  /** Пауза между API заявките в UI (ms) — основен Gmail throttle. */
  chunkPauseMs: number;
};

export const tipsCampaignSendConfig: TipsCampaignSendConfig = {
  functionMaxDurationSeconds: 10,
  chunkSize: 1,
  delayBetweenEmailsMs: 0,
  timeBudgetMs: 7_500,
  fetchTimeoutMs: 8_500,
  sessionCap: 40,
  chunkPauseMs: 2_000,
};

export function getTipsCampaignSendConfig(): TipsCampaignSendConfig {
  return tipsCampaignSendConfig;
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
