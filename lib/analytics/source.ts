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

const MAX_PARAM_LENGTH = 200;

function normalize(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, MAX_PARAM_LENGTH);
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
