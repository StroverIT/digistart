import {
  getOnboardingRequirements,
  ONBOARDING_SERVICE_IDS,
  type OnboardingRequirements,
  type OrderItemForRequirements,
} from "@/lib/onboarding/requirements";
import {
  isBusinessStepComplete,
  isCategoryTemplateStepComplete,
  isIntegrationsStepComplete,
} from "@/lib/onboarding/completion";
import {
  getOnlineStoreSetupItems,
  hasIncompleteOnlineStoreSetup,
  type OnlineStoreSetupItem,
} from "@/lib/onboarding/online-store-setup-status";
import { ONLINE_STORE_SERVICE_ID } from "@/lib/store-dns";
import type { StoreDomainRow } from "@/lib/server/store-domains";
import type { TenantProjectDto } from "@/lib/server/tenant-projects";
import { siteContact } from "@/lib/site-contact";

export type ServiceSetupAction = "onboarding" | "domain" | "brand" | "anchor";

export type ServiceSetupItem = {
  id: string;
  title: string;
  description: string;
  ok: boolean;
  href: string | null;
  cta: string;
  action: ServiceSetupAction;
  /** Does not count toward setup progress when true */
  optional?: boolean;
};

export type ServiceSetupProgress = {
  items: ServiceSetupItem[];
  doneCount: number;
  total: number;
  incomplete: boolean;
};

function onboardingHref(orderItemId: string): string {
  return `/onboarding?orderItemId=${encodeURIComponent(orderItemId)}`;
}

function mapStoreItem(
  row: OnlineStoreSetupItem,
  orderItemId: string,
): ServiceSetupItem {
  let href: string | null = null;
  let action: ServiceSetupAction = "onboarding";
  let cta = "Към онбординга";

  if (row.ok) {
    href = null;
  } else if (row.action === "onboarding") {
    href = onboardingHref(orderItemId);
    cta = "Към онбординга";
    action = "onboarding";
  } else if (row.action === "domain") {
    href = "#store-domain-setup";
    cta = "Към домейн";
    action = "domain";
  } else if (row.action === "brand") {
    href = `mailto:${siteContact.email}?subject=${encodeURIComponent("Бранд материали - онлайн магазин")}`;
    cta = "Имейл";
    action = "brand";
  }

  return {
    id: row.id,
    title: row.label,
    description: row.ok ? "Конфигурирано" : row.missingHint,
    ok: row.ok,
    href,
    cta,
    action,
  };
}

function getSocialMediaSetupItems(
  orderItemId: string,
  project: TenantProjectDto | null,
  requirements: OnboardingRequirements,
): ServiceSetupItem[] {
  const businessOk = isBusinessStepComplete(project, requirements);
  const integrationsOk = isIntegrationsStepComplete(project, requirements);
  const minChannels = requirements.socialChannelCount;

  return [
    {
      id: "business",
      title: "Данни за бизнеса",
      description: businessOk
        ? "Конфигурирано"
        : "Попълни име, телефон и имейл за контакт в онбординга.",
      ok: businessOk,
      href: businessOk ? null : onboardingHref(orderItemId),
      cta: "Към онбординга",
      action: "onboarding",
    },
    {
      id: "social-channels",
      title: minChannels > 1 ? `Социални мрежи (${minChannels} канала)` : "Социални мрежи",
      description: integrationsOk
        ? "Конфигурирано"
        : `Добави поне ${minChannels} валидни линка към профили в онбординга.`,
      ok: integrationsOk,
      href: integrationsOk ? null : onboardingHref(orderItemId),
      cta: "Към онбординга",
      action: "onboarding",
    },
  ];
}

function getGoogleBusinessSetupItems(
  orderItemId: string,
  project: TenantProjectDto | null,
  requirements: OnboardingRequirements,
): ServiceSetupItem[] {
  const businessOk = isBusinessStepComplete(project, requirements);
  const integrationsOk = isIntegrationsStepComplete(project, requirements);

  return [
    {
      id: "business",
      title: "Данни за бизнеса",
      description: businessOk
        ? "Конфигурирано"
        : "Попълни фирмените данни в онбординга.",
      ok: businessOk,
      href: businessOk ? null : onboardingHref(orderItemId),
      cta: "Към онбординга",
      action: "onboarding",
    },
    {
      id: "google-profile",
      title: "Google Business профил",
      description: integrationsOk
        ? "Конфигурирано"
        : "Добави линк към Google Business / Maps профила в онбординга.",
      ok: integrationsOk,
      href: integrationsOk ? null : onboardingHref(orderItemId),
      cta: "Към онбординга",
      action: "onboarding",
    },
  ];
}

function getStoreSetupItems(params: {
  orderItemId: string;
  project: TenantProjectDto | null;
  hasLogo: boolean;
  hasPalette: boolean;
  domain: StoreDomainRow | null;
  requirements: OnboardingRequirements;
}): ServiceSetupItem[] {
  const storeRows = getOnlineStoreSetupItems({
    project: params.project,
    hasLogo: params.hasLogo,
    hasPalette: params.hasPalette,
    domain: params.domain,
    requirements: params.requirements,
  });

  const items = storeRows.map((row) => mapStoreItem(row, params.orderItemId));

  const brandOk = params.hasLogo && params.hasPalette;
  if (!brandOk) {
    items.push({
      id: "brand",
      title: "Бранд материали",
      description:
        "Ако имаш цветова палитра, прати ни я по имейл.",
      ok: false,
      href: `mailto:${siteContact.email}?subject=${encodeURIComponent("Бранд материали - онлайн магазин")}`,
      cta: "Имейл",
      action: "brand",
      optional: true,
    });
  }

  return items;
}

export function getServiceSetupItems(params: {
  serviceId: string;
  orderItemId: string;
  project: TenantProjectDto | null;
  requirements: OnboardingRequirements;
  hasLogo?: boolean;
  hasPalette?: boolean;
  domain?: StoreDomainRow | null;
}): ServiceSetupItem[] {
  const { serviceId, orderItemId, project, requirements } = params;

  if (serviceId === ONLINE_STORE_SERVICE_ID) {
    return getStoreSetupItems({
      orderItemId,
      project,
      hasLogo: params.hasLogo ?? false,
      hasPalette: params.hasPalette ?? false,
      domain: params.domain ?? null,
      requirements,
    });
  }

  if (serviceId === "social-media") {
    return getSocialMediaSetupItems(orderItemId, project, requirements);
  }

  if (serviceId === "google-business") {
    return getGoogleBusinessSetupItems(orderItemId, project, requirements);
  }

  return [];
}

function requiredSetupItems(items: ServiceSetupItem[]): ServiceSetupItem[] {
  return items.filter((i) => !i.optional);
}

export function getServiceSetupProgress(
  items: ServiceSetupItem[],
): Omit<ServiceSetupProgress, "items"> & { items: ServiceSetupItem[] } {
  const required = requiredSetupItems(items);
  const doneCount = required.filter((i) => i.ok).length;
  const total = required.length;
  return {
    items,
    doneCount,
    total,
    incomplete: total > 0 && doneCount < total,
  };
}

export function buildServiceSetupProgress(params: {
  serviceId: string;
  orderItemId: string;
  project: TenantProjectDto | null;
  requirements: OnboardingRequirements;
  hasLogo?: boolean;
  hasPalette?: boolean;
  domain?: StoreDomainRow | null;
}): ServiceSetupProgress {
  const items = getServiceSetupItems(params);
  return getServiceSetupProgress(items);
}

export function getRequirementsForOrderItem(
  orderItems: OrderItemForRequirements[],
  serviceId: string,
): OnboardingRequirements {
  const relevant =
    orderItems.length === 1
      ? orderItems
      : orderItems.filter((i) => i.serviceId === serviceId);
  return getOnboardingRequirements(relevant.length > 0 ? relevant : orderItems);
}

export function hasIncompleteServiceSetup(items: ServiceSetupItem[]): boolean {
  const required = requiredSetupItems(items);
  if (required.length === 0) return false;
  return required.some((i) => !i.ok);
}

export function findFirstOnboardingOrderItem(
  items: { id: string; serviceId: string }[],
): { id: string; serviceId: string } | null {
  return (
    items.find((i) =>
      (ONBOARDING_SERVICE_IDS as readonly string[]).includes(i.serviceId),
    ) ?? null
  );
}

export function getCheckoutSuccessSetupCta(serviceId: string): { label: string } {
  switch (serviceId) {
    case "social-media":
      return { label: "Продължи настройката на каналите" };
    case "google-business":
      return { label: "Продължи настройката в Google" };
    default:
      return { label: "Продължи настройката на магазина" };
  }
}

/** Re-export for store-only callers */
export { hasIncompleteOnlineStoreSetup, isCategoryTemplateStepComplete };
