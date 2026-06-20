export const ADS_BASE_CHANNEL_UPSELL_ID = "base-ad-channel";
export const ADS_EXTRA_CHANNEL_UPSELL_ID = "extra-ad-channels";

export const ADS_CHANNEL_CHOICE_IDS = ["google-ads", "meta-ads"] as const;
export type AdsChannelChoiceId = (typeof ADS_CHANNEL_CHOICE_IDS)[number];

export const DEFAULT_ADS_CHANNEL: AdsChannelChoiceId = "google-ads";

export function getDefaultAdsChannelUpsells(): {
  upsellId: string;
  quantity: number;
  choiceId: AdsChannelChoiceId;
}[] {
  return [
    {
      upsellId: ADS_BASE_CHANNEL_UPSELL_ID,
      quantity: 1,
      choiceId: DEFAULT_ADS_CHANNEL,
    },
  ];
}

export const ADS_BOTH_CHANNELS_SELECTION = "both-channels" as const;
export type AdsChannelPickerValue = AdsChannelChoiceId | typeof ADS_BOTH_CHANNELS_SELECTION;

export const ADS_GOOGLE_CHANNEL_FEATURES = [
  "Ние намираме правилните думи и ги създаваме.",
  "Ние следим печелившите и губещите реклами",
] as const;

export const ADS_META_CHANNEL_FEATURES = [
  "Ние създаваме клиповете, снимките, колекции и т.н.",
] as const;

export function getAdsBuySectionFeatures(
  baseFeatures: readonly string[],
  channel?: AdsChannelPickerValue,
): string[] {
  if (channel === "google-ads") {
    return [...baseFeatures, ...ADS_GOOGLE_CHANNEL_FEATURES];
  }

  if (channel === "meta-ads") {
    return [...baseFeatures, ...ADS_META_CHANNEL_FEATURES];
  }

  if (channel === ADS_BOTH_CHANNELS_SELECTION) {
    return [
      ...baseFeatures,
      ...ADS_GOOGLE_CHANNEL_FEATURES,
      ...ADS_META_CHANNEL_FEATURES,
    ];
  }

  return [...baseFeatures];
}

export function isAdsChannelChoiceId(value: string): value is AdsChannelChoiceId {
  return ADS_CHANNEL_CHOICE_IDS.includes(value as AdsChannelChoiceId);
}

export function getAdsChannelPickerValue(
  upsells: { upsellId: string; quantity: number; choiceId?: string }[],
): AdsChannelPickerValue | undefined {
  if (isAdsExtraChannelEnabled(upsells)) {
    return ADS_BOTH_CHANNELS_SELECTION;
  }

  return getAdsBaseChannelChoiceId(upsells);
}

export function setAdsChannelPickerValue<
  T extends { upsellId: string; quantity: number; choiceId?: string },
>(upsells: T[], value: AdsChannelPickerValue): T[] {
  const withoutChannels = upsells.filter(
    (item) =>
      item.upsellId !== ADS_BASE_CHANNEL_UPSELL_ID &&
      item.upsellId !== ADS_EXTRA_CHANNEL_UPSELL_ID,
  );

  if (value === ADS_BOTH_CHANNELS_SELECTION) {
    return [
      ...withoutChannels,
      {
        upsellId: ADS_BASE_CHANNEL_UPSELL_ID,
        quantity: 1,
        choiceId: "google-ads",
      } as T,
      {
        upsellId: ADS_EXTRA_CHANNEL_UPSELL_ID,
        quantity: 1,
        choiceId: "meta-ads",
      } as T,
    ];
  }

  return [
    ...withoutChannels,
    { upsellId: ADS_BASE_CHANNEL_UPSELL_ID, quantity: 1, choiceId: value } as T,
  ];
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
    return "Избери рекламен канал - Google Ads, Meta Ads или и двете.";
  }

  if (!isAdsExtraChannelEnabled(upsells)) return null;

  const extraChoiceId = getAdsExtraChannelChoiceId(upsells);
  if (!extraChoiceId || extraChoiceId === baseChoiceId) {
    return "Допълнителният канал не е конфигуриран правилно. Опитай отново.";
  }

  return null;
}

export function isAdsExtraChannelEnabled(
  upsells: { upsellId: string; quantity: number; choiceId?: string }[],
): boolean {
  const baseChoiceId = getAdsBaseChannelChoiceId(upsells);
  const extraChoiceId = getAdsExtraChannelChoiceId(upsells);
  return Boolean(
    baseChoiceId && extraChoiceId && extraChoiceId !== baseChoiceId,
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
  const withoutExtra = upsells.filter(
    (item) => item.upsellId !== ADS_EXTRA_CHANNEL_UPSELL_ID,
  );

  const baseChoiceId = getAdsBaseChannelChoiceId(upsells);
  if (!baseChoiceId) {
    return withoutExtra;
  }

  const extra = upsells.find(
    (item) => item.upsellId === ADS_EXTRA_CHANNEL_UPSELL_ID && item.quantity > 0,
  );
  if (!extra) {
    return withoutExtra;
  }

  const extraChoiceId =
    extra.choiceId && isAdsChannelChoiceId(extra.choiceId) ? extra.choiceId : undefined;

  // Drop legacy quantity-only extras (no explicit channel choice).
  if (!extraChoiceId) {
    return withoutExtra;
  }

  const alternateChoiceId = getAlternateAdsChannelChoiceId(baseChoiceId);
  return [
    ...withoutExtra,
    {
      ...extra,
      quantity: 1,
      choiceId: alternateChoiceId,
    },
  ];
}
