import type { ServicePasLandingContent } from "@/components/services/service-pas-landing/types";
import {
  formatSalesChannelsList,
  formatSalesChannelsListOr,
} from "@/lib/visitor-preferences/format-channels";
import type { SalesChannel } from "@/lib/visitor-preferences/types";

const DEFAULT_PHRASE_AND = "Instagram, Facebook или OLX";
const DEFAULT_PHRASE_COMMA = "Instagram, Facebook и OLX";

const SINGLE_PHRASES: Record<SalesChannel, { and: string; comma: string }> = {
  instagram: { and: "Instagram", comma: "Instagram" },
  facebook: { and: "Facebook", comma: "Facebook" },
  olx: { and: "OLX", comma: "OLX" },
  other: { and: "друга платформа", comma: "друга платформа" },
};

const PAIR_PHRASES: Record<string, { and: string; comma: string }> = {
  "instagram,facebook": {
    and: "Instagram или Facebook",
    comma: "Instagram и Facebook",
  },
  "instagram,olx": { and: "Instagram или OLX", comma: "Instagram и OLX" },
  "facebook,olx": { and: "Facebook или OLX", comma: "Facebook и OLX" },
};

function channelKey(channels: readonly SalesChannel[]): string {
  return [...channels]
    .filter((c) => c !== "other")
    .sort()
    .join(",");
}

function buildReplacements(
  channels: readonly SalesChannel[],
  otherLabel?: string,
): { andPhrase: string; commaPhrase: string } {
  const sorted = [...channels].sort();
  const key = channelKey(sorted);

  if (sorted.length === 1) {
    const only = sorted[0];
    if (only === "other" && otherLabel?.trim()) {
      const label = otherLabel.trim();
      return { andPhrase: label, commaPhrase: label };
    }
    const p = SINGLE_PHRASES[only];
    return { andPhrase: p.and, commaPhrase: p.comma };
  }

  if (sorted.length === 2 && !sorted.includes("other") && PAIR_PHRASES[key]) {
    const p = PAIR_PHRASES[key];
    return { andPhrase: p.and, commaPhrase: p.comma };
  }

  return {
    andPhrase: formatSalesChannelsListOr(sorted, otherLabel),
    commaPhrase: formatSalesChannelsList(sorted, otherLabel),
  };
}

function personalizeString(
  value: string,
  andPhrase: string,
  commaPhrase: string,
): string {
  let result = value;
  result = result.split(DEFAULT_PHRASE_AND).join(andPhrase);
  result = result.split(DEFAULT_PHRASE_COMMA).join(commaPhrase);
  return result;
}

function personalizeValue<T>(
  value: T,
  andPhrase: string,
  commaPhrase: string,
): T {
  if (typeof value === "string") {
    return personalizeString(value, andPhrase, commaPhrase) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => personalizeValue(item, andPhrase, commaPhrase)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = personalizeValue(v, andPhrase, commaPhrase);
    }
    return out as T;
  }
  return value;
}

export function personalizePasLanding(
  content: ServicePasLandingContent,
  channels: readonly SalesChannel[],
  otherLabel?: string,
): ServicePasLandingContent {
  const { andPhrase, commaPhrase } = buildReplacements(channels, otherLabel);
  return personalizeValue(content, andPhrase, commaPhrase);
}
