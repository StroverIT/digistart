export const ADS_BASE_CHANNEL_UPSELL_ID = "base-ad-channel";
export const ADS_EXTRA_CHANNEL_UPSELL_ID = "extra-ad-channels";

export const ADS_CHANNEL_CHOICE_IDS = ["google-ads", "meta-ads"] as const;
export type AdsChannelChoiceId = (typeof ADS_CHANNEL_CHOICE_IDS)[number];

export function isAdsChannelChoiceId(value: string): value is AdsChannelChoiceId {
  return ADS_CHANNEL_CHOICE_IDS.includes(value as AdsChannelChoiceId);
}

export function getAdsBaseChannelChoiceId(
  upsells: { upsellId: string; quantity: number; choiceId?: string }[],
): AdsChannelChoiceId | undefined {
  const base = upsells.find(
    (item) => item.upsellId === ADS_BASE_CHANNEL_UPSELL_ID && item.quantity > 0,
  );
  return base?.choiceId && isAdsChannelChoiceId(base.choiceId) ? base.choiceId : undefined;
}

export function getAdsExtraChannelChoiceId(
  upsells: { upsellId: string; quantity: number; choiceId?: string }[],
): AdsChannelChoiceId | undefined {
  const extra = upsells.find(
    (item) => item.upsellId === ADS_EXTRA_CHANNEL_UPSELL_ID && item.quantity > 0,
  );
  return extra?.choiceId && isAdsChannelChoiceId(extra.choiceId) ? extra.choiceId : undefined;
}

export function validateAdsChannelUpsells(
  upsells: { upsellId: string; quantity: number; choiceId?: string }[],
): string | null {
  const baseChoiceId = getAdsBaseChannelChoiceId(upsells);
  if (!baseChoiceId) {
    return "Избери рекламен канал за базовия пакет — Google Ads или Meta Ads.";
  }

  const extra = upsells.find(
    (item) => item.upsellId === ADS_EXTRA_CHANNEL_UPSELL_ID && item.quantity > 0,
  );
  if (!extra) return null;

  const extraChoiceId = getAdsExtraChannelChoiceId(upsells);
  if (!extraChoiceId || extraChoiceId === baseChoiceId) {
    return "Допълнителният канал не е конфигуриран правилно. Опитай отново.";
  }

  return null;
}

export function isAdsExtraChannelEnabled(
  upsells: { upsellId: string; quantity: number }[],
): boolean {
  return upsells.some(
    (item) => item.upsellId === ADS_EXTRA_CHANNEL_UPSELL_ID && item.quantity > 0,
  );
}

export function setAdsExtraChannelEnabled<
  T extends { upsellId: string; quantity: number; choiceId?: string },
>(upsells: T[], enabled: boolean): T[] {
  const withoutExtra = upsells.filter((item) => item.upsellId !== ADS_EXTRA_CHANNEL_UPSELL_ID);
  if (!enabled) return withoutExtra;

  const baseChoiceId = getAdsBaseChannelChoiceId(upsells);
  if (!baseChoiceId) return withoutExtra;

  return normalizeAdsChannelUpsells([
    ...withoutExtra,
    {
      upsellId: ADS_EXTRA_CHANNEL_UPSELL_ID,
      quantity: 1,
      choiceId: getAlternateAdsChannelChoiceId(baseChoiceId),
    } as T,
  ]);
}

export function setAdsBaseChannelUpsell(
  upsells: { upsellId: string; quantity: number; choiceId?: string; entries?: string[]; note?: string }[],
  choiceId: AdsChannelChoiceId,
) {
  const withoutBase = upsells.filter((item) => item.upsellId !== ADS_BASE_CHANNEL_UPSELL_ID);
  return normalizeAdsChannelUpsells([
    ...withoutBase,
    { upsellId: ADS_BASE_CHANNEL_UPSELL_ID, quantity: 1, choiceId },
  ]);
}

export function getAlternateAdsChannelChoiceId(
  choiceId: AdsChannelChoiceId,
): AdsChannelChoiceId {
  return choiceId === "google-ads" ? "meta-ads" : "google-ads";
}

export function normalizeAdsChannelUpsells<
  T extends { upsellId: string; quantity: number; choiceId?: string },
>(upsells: T[]): T[] {
  const baseChoiceId = getAdsBaseChannelChoiceId(upsells);
  if (!baseChoiceId) return upsells;

  const extraIndex = upsells.findIndex(
    (item) => item.upsellId === ADS_EXTRA_CHANNEL_UPSELL_ID && item.quantity > 0,
  );
  if (extraIndex < 0) return upsells;

  const extra = upsells[extraIndex];
  const alternateChoiceId = getAlternateAdsChannelChoiceId(baseChoiceId);
  if (extra.choiceId === alternateChoiceId) return upsells;

  const next = [...upsells];
  next[extraIndex] = {
    ...extra,
    choiceId: alternateChoiceId,
  };
  return next;
}
