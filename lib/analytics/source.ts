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

/** Meta Ads hierarchy snapshot persisted for form attribution (localStorage). */
export type MetaAttribution = {
  campaign?: string;
  adset?: string;
  creative?: string;
  utm_type?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  captured_at?: string;
  landing_page?: string;
};

export const META_URL_PARAM_KEYS = ["campaign", "adset", "creative"] as const;

export const META_ATTRIBUTION_STORAGE_KEY = "digistart_meta_attribution";
export const META_UTM_TYPE_PAID = "paid";

/**
 * Default Meta Ads URL parameters.
 * Dynamic macros expand per impression/click in Ads Manager.
 */
export const META_ADS_URL_PARAMS_TEMPLATE = [
  "utm_type=paid",
  "campaign={{campaign.name}}",
  "adset={{adset.name}}",
  "creative={{ad.name}}",
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
 * Extracts UTM + Meta Ads hierarchy params (`campaign`, `adset`, `creative`).
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

  copyIfPresent("campaign");
  copyIfPresent("adset");
  copyIfPresent("creative");
  copyIfPresent("utm_type");
  copyIfPresent("utm_source");
  copyIfPresent("utm_medium");
  copyIfPresent("utm_campaign");
  copyIfPresent("utm_term");
  copyIfPresent("utm_content");

  const hasHierarchy = Boolean(attribution.campaign || attribution.adset || attribution.creative);
  if (!hasHierarchy && !attribution.utm_type) return null;

  // Paid Meta landings always carry utm_type=paid (set if hierarchy present).
  if (hasHierarchy && !attribution.utm_type) {
    attribution.utm_type = META_UTM_TYPE_PAID;
  }

  attribution.captured_at = new Date().toISOString();
  if (landingPage) attribution.landing_page = landingPage.slice(0, 500);
  return attribution;
}

export function persistMetaAttribution(attribution: MetaAttribution) {
  try {
    const serialized = JSON.stringify(attribution);
    localStorage.setItem(META_ATTRIBUTION_STORAGE_KEY, serialized);
    // Mirror for same-tab redirects before localStorage sync edge cases.
    sessionStorage.setItem(META_ATTRIBUTION_STORAGE_KEY, serialized);
  } catch {
    /* ignore quota / private mode */
  }
}

export function readMetaAttribution(): MetaAttribution | null {
  try {
    const raw =
      localStorage.getItem(META_ATTRIBUTION_STORAGE_KEY) ??
      sessionStorage.getItem(META_ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const attribution = sanitizeMetaAttribution(parsed as Record<string, unknown>);
    if (!attribution) return null;

    const hasHierarchy = Boolean(
      attribution.campaign || attribution.adset || attribution.creative,
    );
    if (hasHierarchy && !attribution.utm_type) {
      attribution.utm_type = META_UTM_TYPE_PAID;
    }

    return attribution;
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
    "campaign",
    "adset",
    "creative",
    "utm_type",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
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
