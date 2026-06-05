import { isStoreSocialSetupComplete } from "@/lib/onboarding/completion";
import type { OnboardingRequirements } from "@/lib/onboarding/requirements";
import { applyProjectToRequirements } from "@/lib/onboarding/requirements";
import {
  deriveSetupStepsFromProject,
  resolveSetupStepOk,
  type OnboardingSetupStepId,
} from "@/lib/onboarding/setup-steps";
import type { TenantProjectDto } from "@/lib/server/tenant-projects";
import type { StoreDomainRow } from "@/lib/server/store-domains";

export type OnlineStoreSetupItem = {
  id: string;
  label: string;
  ok: boolean;
  /** Shown when `ok` is false */
  missingHint: string;
  /** Shown when `ok` is true (defaults to "Конфигурирано") */
  completeHint?: string;
  /** "onboarding" | "domain" | "brand" */
  action: "onboarding" | "domain" | "brand";
};

const ONBOARDING_ROW_TO_STEP: Record<string, OnboardingSetupStepId> = {
  "product-type": "product-type",
  template: "template",
  business: "business",
  products: "products",
  onboarding: "social",
};

export function getOnlineStoreSetupItems(params: {
  project: TenantProjectDto | null;
  hasLogo: boolean;
  hasPalette: boolean;
  domain: StoreDomainRow | null;
  requirements?: OnboardingRequirements;
}): OnlineStoreSetupItem[] {
  const p = params.project;
  const requirements = applyProjectToRequirements(
    params.requirements ??
      ({
        showCategoryTemplate: true,
        showTemplatePicker: true,
        showBusiness: true,
        showIntegrations: true,
        socialChannelCount: 0,
        showGoogleBusinessLink: false,
        showStoreSocialFields: true,
      } satisfies OnboardingRequirements),
    p,
  );

  const stored = p?.onboardingStepsCompleted ?? {};
  const derived = deriveSetupStepsFromProject(p, requirements);

  const stepOk = (rowId: string): boolean => {
    const stepId = ONBOARDING_ROW_TO_STEP[rowId];
    if (!stepId) return false;
    return resolveSetupStepOk(stepId, stored, derived);
  };

  const brandOk = params.hasLogo && params.hasPalette;
  const domainOk = params.domain?.status === "configured";
  const domainHint = (() => {
    if (domainOk) return "";
    const st = params.domain?.status;
    if (st === "pending") return "Домейнът е изпратен - очаква се потвърждение на DNS.";
    if (st === "misconfigured") return "DNS записите не съвпадат - виж инструкциите и поправи ги.";
    return "Добави домейн и DNS записи по инструкциите по-долу.";
  })();

  return [
    {
      id: "product-type",
      label: "Тип продукти",
      ok: stepOk("product-type"),
      missingHint: "Избери дали продуктите са уникални или с количество в онбординга.",
      action: "onboarding",
    },
    {
      id: "template",
      label: "Темплейт",
      ok: stepOk("template"),
      missingHint: requirements.showTemplatePicker
        ? "Избери шаблон в онбординга."
        : "Шаблонът е избран при покупка.",
      completeHint: requirements.showTemplatePicker ? "Конфигурирано" : "Избран при покупка",
      action: "onboarding",
    },
    {
      id: "business",
      label: "Данни за бизнеса",
      ok: stepOk("business"),
      missingHint: "Попълни име, телефон и имейл за контакт.",
      action: "onboarding",
    },
    {
      id: "products",
      label: "Продукти и бележки",
      ok: stepOk("products"),
      missingHint: "Опиши продуктите или дай линк към каталог.",
      action: "onboarding",
    },
    {
      id: "onboarding",
      label: "Социални мрежи (онбординг)",
      ok: stepOk("onboarding"),
      missingHint: "Добави линкове към социалните профили в онбординга.",
      action: "onboarding",
    },
    {
      id: "domain",
      label: "Персонален домейн (DNS)",
      ok: domainOk,
      missingHint: domainHint,
      action: "domain",
    },
  ];
}

export function hasIncompleteOnlineStoreSetup(items: OnlineStoreSetupItem[]): boolean {
  return items.some((i) => !i.ok);
}
