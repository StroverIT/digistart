import { isIntegrationsStepComplete } from "@/lib/onboarding/completion";
import type { OnboardingRequirements } from "@/lib/onboarding/requirements";
import { isProductSalesType } from "@/lib/onboarding/requirements";
import { hasSelectedTemplates } from "@/lib/onboarding/selected-templates";
import type { TenantProjectDto } from "@/lib/server/tenant-projects";
import type { StoreDomainRow } from "@/lib/server/store-domains";

export type OnlineStoreSetupItem = {
  id: string;
  label: string;
  ok: boolean;
  /** Shown when `ok` is false */
  missingHint: string;
  /** "onboarding" | "domain" | "brand" */
  action: "onboarding" | "domain" | "brand";
};

export function getOnlineStoreSetupItems(params: {
  project: TenantProjectDto | null;
  hasLogo: boolean;
  hasPalette: boolean;
  domain: StoreDomainRow | null;
  requirements?: OnboardingRequirements;
}): OnlineStoreSetupItem[] {
  const p = params.project;
  const bs = p?.businessSettings ?? {};
  const name = String(bs.businessName ?? "").trim();
  const phone = String(bs.phone ?? "").trim();
  const email = String(bs.email ?? "").trim();
  const productNotes = String(bs.productNotes ?? "").trim();
  const productSalesType = bs.productSalesType;

  const templateOk = hasSelectedTemplates(bs, p?.templateId);
  const productTypeOk = isProductSalesType(productSalesType);
  const businessOk = Boolean(name && phone && email);
  const productsOk = productNotes.length > 0;
  const requirements =
    params.requirements ??
    ({
      showCategoryTemplate: true,
      showBusiness: true,
      showIntegrations: true,
      socialChannelCount: 0,
      showGoogleBusinessLink: false,
      showStoreSocialFields: true,
    } satisfies OnboardingRequirements);
  const onboardingOk = Boolean(p && isIntegrationsStepComplete(p, requirements));
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
      ok: productTypeOk,
      missingHint: "Избери дали продуктите са уникални или с количество в онбординга.",
      action: "onboarding",
    },
    {
      id: "template",
      label: "Категории продукти",
      ok: templateOk,
      missingHint: "Избери поне една категория в онбординга.",
      action: "onboarding",
    },
    {
      id: "business",
      label: "Данни за бизнеса",
      ok: businessOk,
      missingHint: "Попълни име, телефон и имейл за контакт.",
      action: "onboarding",
    },
    {
      id: "products",
      label: "Продукти и бележки",
      ok: productsOk,
      missingHint: "Опиши продуктите или дай линк към каталог.",
      action: "onboarding",
    },
    {
      id: "onboarding",
      label: "Социални мрежи (онбординг)",
      ok: onboardingOk,
      missingHint: "Завърши последната стъпка от онбординга.",
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
