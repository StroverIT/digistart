import {
  COMPETITOR_PLATFORM_LABELS,
  type CompetitorPlatform,
  type CompetitorPlatformAnswer,
} from "@/lib/funnel/competitor-platform";

const PLATFORM_LIST_PATTERNS = [
  /Shopify, WooCommerce, CloudCart и WordPress/g,
  /Shopify, WooCommerce, WordPress и CloudCart/g,
  /Shopify, WooCommerce и WordPress/g,
] as const;

const AGITATE_SENTENCE_BY_PLATFORM: Record<CompetitorPlatform, string | ((label: string) => string)> = {
  shopify:
    "Клиентът не чака да намериш правилния Shopify app – просто купува от другаде.",
  woocommerce: "Клиентът не чака да оправиш WooCommerce – просто купува от другаде.",
  wordpress: "Клиентът не чака да оправиш WordPress – просто купува от другаде.",
  cloudcart: "Клиентът не чака да оправиш CloudCart – просто купува от другаде.",
  other: (label) => `Клиентът не чака да оправиш ${label} – просто купува от другаде.`,
};

const AGITATE_DEFAULT =
  "Клиентът не чака да оправиш WooCommerce или да намериш правилния Shopify app – просто купува от другаде.";

export const COMPETITOR_PLATFORM_PLACEHOLDER = "{{platform}}";

export const COMPETITOR_PLATFORM_FALLBACK_LABEL =
  "Shopify, WooCommerce, CloudCart или WordPress";

export function getCompetitorPlatformDisplayLabel(answer: CompetitorPlatformAnswer): string {
  if (answer.platform === "other" && answer.otherLabel) {
    return answer.otherLabel;
  }
  return COMPETITOR_PLATFORM_LABELS[answer.platform];
}

export function applyCompetitorPlatformPlaceholder(
  text: string,
  answer: CompetitorPlatformAnswer | null,
): string {
  const label = answer
    ? getCompetitorPlatformDisplayLabel(answer)
    : COMPETITOR_PLATFORM_FALLBACK_LABEL;

  return text.split(COMPETITOR_PLATFORM_PLACEHOLDER).join(label);
}

export function personalizeCompetitorCopy(
  text: string,
  answer: CompetitorPlatformAnswer,
): string {
  const label = getCompetitorPlatformDisplayLabel(answer);

  let result = text;
  for (const pattern of PLATFORM_LIST_PATTERNS) {
    result = result.replace(pattern, label);
  }

  if (result.includes(AGITATE_DEFAULT)) {
    const agitateEntry = AGITATE_SENTENCE_BY_PLATFORM[answer.platform];
    const agitateReplacement =
      typeof agitateEntry === "function" ? agitateEntry(label) : agitateEntry;
    result = result.replace(AGITATE_DEFAULT, agitateReplacement);
  }

  result = result.replace(/те връщат/g, "те връща");

  return applyCompetitorPlatformPlaceholder(result, answer);
}
