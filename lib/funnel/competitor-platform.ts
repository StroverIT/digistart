export const FUNNEL_COMPETITOR_STORAGE_KEY = "digistart-funnel-competitor-v1";
export const COMPETITOR_PLATFORM_UPDATED_EVENT = "competitor-platform-updated";

export const COMPETITOR_PLATFORMS = [
  "shopify",
  "woocommerce",
  "wordpress",
  "cloudcart",
  "other",
] as const;

export type CompetitorPlatform = (typeof COMPETITOR_PLATFORMS)[number];

export type CompetitorPlatformAnswer = {
  platform: CompetitorPlatform;
  otherLabel?: string;
  answeredAt: string;
};

type CompetitorPlatformStorageV1 = {
  version: 1;
  answers: Record<string, CompetitorPlatformAnswer>;
};

const STORAGE_VERSION = 1 as const;

export const COMPETITOR_PLATFORM_OPTIONS: Array<{
  id: CompetitorPlatform;
  label: string;
  logoSrc?: string;
}> = [
  { id: "shopify", label: "Shopify", logoSrc: "/competitors-logo/shopify.png" },
  { id: "woocommerce", label: "WooCommerce", logoSrc: "/competitors-logo/woocommerce.svg" },
  { id: "wordpress", label: "WordPress", logoSrc: "/competitors-logo/wordpress.jpg" },
  { id: "cloudcart", label: "CloudCart", logoSrc: "/competitors-logo/cloudcart.png" },
  { id: "other", label: "Други" },
];

export const COMPETITOR_PLATFORM_LABELS: Record<CompetitorPlatform, string> = {
  shopify: "Shopify",
  woocommerce: "WooCommerce",
  wordpress: "WordPress",
  cloudcart: "CloudCart",
  other: "Други",
};

function isCompetitorPlatform(value: unknown): value is CompetitorPlatform {
  return typeof value === "string" && COMPETITOR_PLATFORMS.includes(value as CompetitorPlatform);
}

function parseStorage(raw: string): CompetitorPlatformStorageV1 | null {
  try {
    const parsed = JSON.parse(raw) as Partial<CompetitorPlatformStorageV1>;
    if (parsed.version !== STORAGE_VERSION || typeof parsed.answers !== "object" || !parsed.answers) {
      return null;
    }

    const answers: Record<string, CompetitorPlatformAnswer> = {};
    for (const [funnelId, answer] of Object.entries(parsed.answers)) {
      if (!answer || typeof answer !== "object") continue;
      const platform = (answer as CompetitorPlatformAnswer).platform;
      const answeredAt = (answer as CompetitorPlatformAnswer).answeredAt;
      if (!isCompetitorPlatform(platform) || typeof answeredAt !== "string") continue;

      const otherLabel =
        typeof (answer as CompetitorPlatformAnswer).otherLabel === "string" &&
        (answer as CompetitorPlatformAnswer).otherLabel!.trim().length > 0
          ? (answer as CompetitorPlatformAnswer).otherLabel!.trim()
          : undefined;

      if (platform === "other" && !otherLabel) continue;

      answers[funnelId] = {
        platform,
        ...(otherLabel ? { otherLabel } : {}),
        answeredAt,
      };
    }

    return { version: STORAGE_VERSION, answers };
  } catch {
    return null;
  }
}

function readStorage(): CompetitorPlatformStorageV1 {
  if (typeof window === "undefined") {
    return { version: STORAGE_VERSION, answers: {} };
  }

  const raw = window.localStorage.getItem(FUNNEL_COMPETITOR_STORAGE_KEY);
  if (!raw) return { version: STORAGE_VERSION, answers: {} };

  return parseStorage(raw) ?? { version: STORAGE_VERSION, answers: {} };
}

function writeStorage(data: CompetitorPlatformStorageV1): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FUNNEL_COMPETITOR_STORAGE_KEY, JSON.stringify(data));
}

export function getCompetitorPlatformAnswer(funnelId: string): CompetitorPlatformAnswer | null {
  const storage = readStorage();
  return storage.answers[funnelId] ?? null;
}

export function hasCompetitorPlatformAnswer(funnelId: string): boolean {
  return getCompetitorPlatformAnswer(funnelId) !== null;
}

export function saveCompetitorPlatformAnswer(
  funnelId: string,
  answer: Omit<CompetitorPlatformAnswer, "answeredAt">,
): CompetitorPlatformAnswer {
  const storage = readStorage();
  const stored: CompetitorPlatformAnswer = {
    ...answer,
    answeredAt: new Date().toISOString(),
  };
  storage.answers[funnelId] = stored;
  writeStorage(storage);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(COMPETITOR_PLATFORM_UPDATED_EVENT, {
        detail: { funnelId },
      }),
    );
  }

  return stored;
}
