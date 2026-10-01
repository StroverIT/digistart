export type TrackingParams = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
};

export type TrackingMetadata = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
};

export type UtmPayload = Record<string, string>;

/** Meta Ads hierarchy + UTM snapshot persisted for form attribution. */
export type MetaAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  campaign_id?: string;
  adset_id?: string;
  ad_id?: string;
  captured_at?: string;
  landing_page?: string;
};

export const META_URL_PARAM_KEYS = [
  "campaign_id",
  "adset_id",
  "ad_id",
] as const;

export const META_ATTRIBUTION_STORAGE_KEY = "digistart_meta_attribution";

/**
 * Default Meta Ads URL parameters (campaign / ad set / creative).
 * Dynamic macros expand per impression/click in Ads Manager.
 */
export const META_ADS_URL_PARAMS_TEMPLATE = [
  "utm_source=facebook",
  "utm_medium=paid",
  "utm_campaign={{campaign.name}}",
  "utm_term={{adset.name}}",
  "utm_content={{ad.name}}",
].join("&");

const MAX_PARAM_LENGTH = 200;
const META_PARAM_KEY_SET = new Set<string>(META_URL_PARAM_KEYS);

function normalize(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, MAX_PARAM_LENGTH);
}

function isTrackingParamKey(key: string): boolean {
  return key.startsWith("utm_") || META_PARAM_KEY_SET.has(key);
}

/**
 * Reads UTM params from a URLSearchParams and derives a normalized Meta
 * traffic source from `utm_source` / `utm_medium` placement values.
 */
export function extractTrackingParams(params: URLSearchParams): TrackingParams {
  const utmSource = normalize(params.get("utm_source"));
  const utmMedium = normalize(params.get("utm_medium"));
  const utmCampaign = normalize(params.get("utm_campaign"));
  const utmContent = normalize(params.get("utm_content"));

  return {
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
  };
}

export function buildTrackingMetadata(params: TrackingParams): TrackingMetadata {
  const metadata: TrackingMetadata = {};
  if (params.utmSource) metadata.utm_source = params.utmSource;
  if (params.utmMedium) metadata.utm_medium = params.utmMedium;
  if (params.utmCampaign) metadata.utm_campaign = params.utmCampaign;
  if (params.utmContent) metadata.utm_content = params.utmContent;
  return metadata;
}

/** Path + query with UTM / Meta tracking params stripped. */
export function stripUtmParamsFromUrl(url: URL): string {
  const cleanParams = new URLSearchParams();
  for (const [key, value] of url.searchParams.entries()) {
    if (isTrackingParamKey(key)) continue;
    cleanParams.set(key, value);
  }

  const query = cleanParams.toString();
  return query ? `${url.pathname}?${query}` : url.pathname;
}

/**
 * Extracts every query param prefixed with `utm_`.
 */
export function extractAllUtmParams(params: URLSearchParams): UtmPayload {
  const payload: UtmPayload = {};
  for (const [key, rawValue] of params.entries()) {
    if (!key.startsWith("utm_")) continue;
    const normalizedValue = normalize(rawValue);
    if (!normalizedValue) continue;
    payload[key] = normalizedValue;
  }

  return payload;
}

/**
 * Extracts UTM + Meta Ads hierarchy params (`campaign_id`, `adset_id`, `ad_id`).
 */
export function extractTrackingPayload(params: URLSearchParams): UtmPayload {
  const payload: UtmPayload = {};
  for (const [key, rawValue] of params.entries()) {
    if (!isTrackingParamKey(key)) continue;
    const normalizedValue = normalize(rawValue);
    if (!normalizedValue) continue;
    payload[key] = normalizedValue;
  }
  return payload;
}

export function isValidTrackingPayloadKey(key: string): boolean {
  return isTrackingParamKey(key);
}

export function buildMetaAttributionFromPayload(
  payload: Record<string, string>,
  landingPage?: string,
): MetaAttribution | null {
  const attribution: MetaAttribution = {};

  const copyIfPresent = (key: keyof MetaAttribution & string) => {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) {
      attribution[key] = value.trim().slice(0, MAX_PARAM_LENGTH);
    }
  };

  copyIfPresent("utm_source");
  copyIfPresent("utm_medium");
  copyIfPresent("utm_campaign");
  copyIfPresent("utm_term");
  copyIfPresent("utm_content");
  copyIfPresent("campaign_id");
  copyIfPresent("adset_id");
  copyIfPresent("ad_id");

  if (Object.keys(attribution).length === 0) return null;

  attribution.captured_at = new Date().toISOString();
  if (landingPage) attribution.landing_page = landingPage.slice(0, 500);
  return attribution;
}

export function persistMetaAttribution(attribution: MetaAttribution) {
  try {
    sessionStorage.setItem(META_ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    /* ignore quota / private mode */
  }
}

export function readMetaAttribution(): MetaAttribution | null {
  try {
    const raw = sessionStorage.getItem(META_ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return sanitizeMetaAttribution(parsed as Record<string, unknown>);
  } catch {
    return null;
  }
}

export function sanitizeMetaAttribution(
  value: Record<string, unknown> | null | undefined,
): MetaAttribution | null {
  if (!value) return null;
  const attribution: MetaAttribution = {};
  const keys: (keyof MetaAttribution)[] = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "campaign_id",
    "adset_id",
    "ad_id",
    "captured_at",
    "landing_page",
  ];

  for (const key of keys) {
    const raw = value[key];
    if (typeof raw !== "string") continue;
    const normalized = normalize(raw);
    if (!normalized) continue;
    attribution[key] = normalized;
  }

  return Object.keys(attribution).length > 0 ? attribution : null;
}
