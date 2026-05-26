import type { CartItemUpsell } from "@/lib/types";

export const ONBOARDING_SERVICE_IDS = ["ready-store", "social-media", "google-business"] as const;
export type OnboardingServiceId = (typeof ONBOARDING_SERVICE_IDS)[number];

export type SocialChannelInput = {
  label?: string;
  profileUrl: string;
};

export type OnboardingRequirements = {
  showCategoryTemplate: boolean;
  showBusiness: boolean;
  showIntegrations: boolean;
  socialChannelCount: number;
  showGoogleBusinessLink: boolean;
  showStoreSocialFields: boolean;
};

export type OrderItemForRequirements = {
  serviceId: string;
  upsells: CartItemUpsell[] | unknown;
};

function parseUpsells(raw: unknown): CartItemUpsell[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (entry): entry is CartItemUpsell =>
      typeof entry === "object" &&
      entry !== null &&
      typeof (entry as CartItemUpsell).upsellId === "string" &&
      typeof (entry as CartItemUpsell).quantity === "number",
  );
}

function socialChannelCountFromUpsells(upsells: CartItemUpsell[]): number {
  const extra = upsells.find((u) => u.upsellId === "extra-channels")?.quantity ?? 0;
  return 1 + Math.max(0, extra);
}

export function getOnboardingRequirements(
  orderItems: OrderItemForRequirements[],
): OnboardingRequirements {
  const hasStore = orderItems.some((i) => i.serviceId === "ready-store");
  const hasSocial = orderItems.some((i) => i.serviceId === "social-media");
  const hasGmb = orderItems.some((i) => i.serviceId === "google-business");

  let socialChannelCount = 0;
  if (hasSocial) {
    const socialItem = orderItems.find((i) => i.serviceId === "social-media");
    socialChannelCount = socialChannelCountFromUpsells(parseUpsells(socialItem?.upsells));
  }

  return {
    showCategoryTemplate: hasStore,
    showBusiness: hasStore || hasSocial || hasGmb,
    showIntegrations: hasStore || hasSocial || hasGmb,
    socialChannelCount,
    showGoogleBusinessLink: hasGmb,
    showStoreSocialFields: hasStore && !hasSocial,
  };
}

export const WIZARD_STEP_DEFS = [
  { id: 1 as const, title: "Категория" },
  { id: 2 as const, title: "Шаблон" },
  { id: 3 as const, title: "Бизнес и продукти" },
  { id: 4 as const, title: "Социални мрежи" },
];

export const EMPTY_SOCIAL_CHANNEL: SocialChannelInput = { label: "", profileUrl: "" };

export function normalizeSocialChannels(
  channels: SocialChannelInput[],
  minCount = 1,
): SocialChannelInput[] {
  const trimmed = channels.filter(
    (c) => c.label?.trim() || c.profileUrl.trim(),
  );
  if (trimmed.length >= minCount) return trimmed;
  const padded = [...channels];
  while (padded.length < minCount) {
    padded.push({ ...EMPTY_SOCIAL_CHANNEL });
  }
  return padded;
}

export function getActiveWizardSteps(requirements: OnboardingRequirements) {
  return WIZARD_STEP_DEFS.filter((s) => {
    if (s.id === 1 || s.id === 2) return requirements.showCategoryTemplate;
    if (s.id === 3) return requirements.showBusiness;
    if (s.id === 4) return requirements.showIntegrations;
    return false;
  });
}

export function getFirstWizardStep(requirements: OnboardingRequirements): number {
  return getActiveWizardSteps(requirements)[0]?.id ?? 3;
}

export function getNextWizardStep(
  current: number,
  requirements: OnboardingRequirements,
): number | null {
  const active = getActiveWizardSteps(requirements);
  const idx = active.findIndex((s) => s.id === current);
  if (idx < 0 || idx >= active.length - 1) return null;
  return active[idx + 1].id;
}

export function getPrevWizardStep(
  current: number,
  requirements: OnboardingRequirements,
): number | null {
  const active = getActiveWizardSteps(requirements);
  const idx = active.findIndex((s) => s.id === current);
  if (idx <= 0) return null;
  return active[idx - 1].id;
}

export function normalizeWizardStep(
  savedStep: number,
  requirements: OnboardingRequirements,
): number {
  const active = getActiveWizardSteps(requirements);
  if (active.some((s) => s.id === savedStep)) return savedStep;
  const fallback = active.find((s) => s.id >= savedStep);
  return fallback?.id ?? active[active.length - 1].id;
}

export function parseSocialChannelsFromSettings(
  socialSettings: Record<string, unknown> | null | undefined,
  minCount = 1,
): SocialChannelInput[] {
  const channels = socialSettings?.channels;
  if (Array.isArray(channels) && channels.length > 0) {
    const parsed = channels.map((c) => {
      const row = c as Record<string, unknown>;
      return {
        label: typeof row.label === "string" ? row.label : "",
        profileUrl: typeof row.profileUrl === "string" ? row.profileUrl : "",
      };
    });
    return normalizeSocialChannels(parsed, minCount);
  }

  const legacy: SocialChannelInput[] = [];
  const fb = socialSettings?.facebook;
  const ig = socialSettings?.instagram;
  if (typeof fb === "string" && fb) legacy.push({ label: "Facebook", profileUrl: fb });
  if (typeof ig === "string" && ig) legacy.push({ label: "Instagram", profileUrl: ig });

  if (legacy.length > 0) {
    return normalizeSocialChannels(legacy, minCount);
  }

  return normalizeSocialChannels([], minCount);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    return Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function getOnboardingBannerCopy(serviceId: string): {
  title: string;
  description: string;
} {
  switch (serviceId) {
    case "social-media":
      return {
        title: "Довърши настройката на каналите",
        description:
          "Попълни бизнес данните и линковете към профилите, за да започнем управлението на социалните ти мрежи.",
      };
    case "google-business":
      return {
        title: "Довърши настройката на Google Business",
        description:
          "Попълни фирмените данни и линка към профила, за да оптимизираме присъствието ти в Google.",
      };
    default:
      return {
        title: "Довърши настройката на магазина",
        description:
          "Избери шаблон, попълни бизнес данните и свържи профилите за онлайн магазина.",
      };
  }
}
