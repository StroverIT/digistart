import { calculateItemTotal } from "@/lib/pricing/calculate-item-total";
import type { CartItemUpsell } from "@/lib/types";
import { getServiceById } from "@/lib/data/services";

export type PlanId = "start" | "growth" | "full";

export interface PlanLineItem {
  label: string;
  monthlyAmount: number;
  oneTimeAmount?: number;
}

export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  tagline: string;
  description: string;
  discountPercent: number;
  listMonthly: number;
  monthlyTotal: number;
  oneTimeTotal: number;
  features: string[];
  highlighted?: boolean;
  lineItems: PlanLineItem[];
}

type PlanComponent = {
  serviceId: string;
  optionId: string;
  upsells?: CartItemUpsell[];
  /** Override line label; defaults to service option name + upsell summary */
  label?: string;
};

type PlanDefinition = {
  id: PlanId;
  name: string;
  tagline: string;
  description: string;
  discountPercent: number;
  highlighted?: boolean;
  features: string[];
  monthlyComponents: PlanComponent[];
  oneTimeComponents?: PlanComponent[];
};

const STORE_ID = "ready-store";
const STORE_OPTION = "subscription";
const SOCIAL_ID = "social-media";
const SOCIAL_OPTION = "default";
const GOOGLE_ID = "google-business";
const GOOGLE_OPTION = "basic";

const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    id: "start",
    name: "Digi",
    tagline: "Онлайн магазин + 1 социален канал",
    description:
      "Идеален за първа стъпка онлайн: готов магазин с шаблон и базово присъствие в социалните мрежи.",
    discountPercent: 0,
    features: [
      "Абонаментен онлайн магазин (шаблон, поръчки, Meta Pixel)",
      "Хостинг и SSL сертификат (HTTPS)",
      "1 канал в социалните мрежи (2 публикации седмично)",
      "Настройка за 1 работен ден",
    ],
    monthlyComponents: [
      { serviceId: STORE_ID, optionId: STORE_OPTION },
      { serviceId: SOCIAL_ID, optionId: SOCIAL_OPTION },
    ],
  },
  {
    id: "growth",
    name: "Digistart",
    tagline: "Плащания, куриер и 2 канала",
    description:
      "Разширен пакет с онлайн плащания, доставка и два социални канала - с 10% отстъпка.",
    discountPercent: 10,
    highlighted: true,
    features: [
      "Всичко от Digi, плюс плащане с карта",
      "1 куриер по избор (Еконт или Спиди)",
      "2 канала в социалните мрежи",
      "10% отстъпка от месечната цена",
    ],
    monthlyComponents: [
      {
        serviceId: STORE_ID,
        optionId: STORE_OPTION,
        upsells: [
          { upsellId: "online-payments", quantity: 1 },
          { upsellId: "courier-integration", quantity: 1, choiceId: "econt" },
        ],
      },
      {
        serviceId: SOCIAL_ID,
        optionId: SOCIAL_OPTION,
        upsells: [{ upsellId: "extra-channels", quantity: 1 }],
      },
    ],
  },
  {
    id: "full",
    name: "Digistart Premium",
    tagline: "Растеж + Google Business",
    description:
      "Пълен дигитален пакет с Google Business профил и 15% отстъпка от месечната цена.",
    discountPercent: 15,
    features: [
      "Всичко от Digistart",
      "Google Business - базова настройка на профила (еднократно)",
      "15% отстъпка от месечната цена",
    ],
    monthlyComponents: [
      {
        serviceId: STORE_ID,
        optionId: STORE_OPTION,
        upsells: [
          { upsellId: "online-payments", quantity: 1 },
          { upsellId: "courier-integration", quantity: 1, choiceId: "econt" },
        ],
      },
      {
        serviceId: SOCIAL_ID,
        optionId: SOCIAL_OPTION,
        upsells: [{ upsellId: "extra-channels", quantity: 1 }],
      },
    ],
    oneTimeComponents: [{ serviceId: GOOGLE_ID, optionId: GOOGLE_OPTION }],
  },
];

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function componentLabel(component: PlanComponent): string {
  if (component.label) return component.label;

  const service = getServiceById(component.serviceId);
  const option = service?.options.find((o) => o.id === component.optionId);
  const base = option?.name ?? service?.name ?? component.serviceId;

  if (!component.upsells?.length) return base;

  const upsellParts: string[] = [];
  for (const item of component.upsells) {
    const upsell = service?.upsells.find((u) => u.id === item.upsellId);
    if (!upsell) continue;
    if (upsell.kind === "choice" && item.choiceId) {
      const choice = upsell.choices?.find((c) => c.id === item.choiceId);
      upsellParts.push(choice?.name ?? upsell.name);
    } else if (item.quantity > 1) {
      upsellParts.push(`${upsell.name} (×${item.quantity})`);
    } else {
      upsellParts.push(upsell.name);
    }
  }

  return upsellParts.length ? `${base} + ${upsellParts.join(", ")}` : base;
}

function sumComponents(components: PlanComponent[]): {
  monthly: number;
  oneTime: number;
  lineItems: PlanLineItem[];
} {
  let monthly = 0;
  let oneTime = 0;
  const lineItems: PlanLineItem[] = [];

  for (const component of components) {
    const totals = calculateItemTotal(
      component.serviceId,
      component.optionId,
      component.upsells ?? [],
    );
    monthly += totals.monthlyTotal;
    oneTime += totals.oneTimeTotal;
    lineItems.push({
      label: componentLabel(component),
      monthlyAmount: totals.monthlyTotal,
      ...(totals.oneTimeTotal > 0 ? { oneTimeAmount: totals.oneTimeTotal } : {}),
    });
  }

  return { monthly, oneTime, lineItems };
}

function buildPlan(def: PlanDefinition): SubscriptionPlan {
  const monthlySum = sumComponents(def.monthlyComponents);
  const oneTimeSum = def.oneTimeComponents?.length
    ? sumComponents(def.oneTimeComponents)
    : { monthly: 0, oneTime: 0, lineItems: [] as PlanLineItem[] };

  const listMonthly = roundMoney(monthlySum.monthly);
  const monthlyTotal = roundMoney(listMonthly * (1 - def.discountPercent / 100));
  const oneTimeTotal = roundMoney(oneTimeSum.oneTime);

  return {
    id: def.id,
    name: def.name,
    tagline: def.tagline,
    description: def.description,
    discountPercent: def.discountPercent,
    listMonthly,
    monthlyTotal,
    oneTimeTotal,
    features: def.features,
    highlighted: def.highlighted,
    lineItems: [...monthlySum.lineItems, ...oneTimeSum.lineItems],
  };
}

export const subscriptionPlans: SubscriptionPlan[] = PLAN_DEFINITIONS.map(buildPlan);

export function getPlanById(id: PlanId): SubscriptionPlan | undefined {
  return subscriptionPlans.find((p) => p.id === id);
}

export function getPlanTotals(planId: PlanId): {
  listMonthly: number;
  monthlyTotal: number;
  oneTimeTotal: number;
  discountPercent: number;
} {
  const plan = getPlanById(planId);
  if (!plan) {
    return { listMonthly: 0, monthlyTotal: 0, oneTimeTotal: 0, discountPercent: 0 };
  }
  return {
    listMonthly: plan.listMonthly,
    monthlyTotal: plan.monthlyTotal,
    oneTimeTotal: plan.oneTimeTotal,
    discountPercent: plan.discountPercent,
  };
}

/** Synthetic service id prefix for bundle cart / Stripe catalog. */
export const PLAN_SERVICE_ID_PREFIX = "bundle-plan-";

export function planToServiceId(planId: PlanId): string {
  return `${PLAN_SERVICE_ID_PREFIX}${planId}`;
}

export function serviceIdToPlanId(serviceId: string): PlanId | null {
  if (!serviceId.startsWith(PLAN_SERVICE_ID_PREFIX)) return null;
  const id = serviceId.slice(PLAN_SERVICE_ID_PREFIX.length) as PlanId;
  return getPlanById(id) ? id : null;
}

/** In-app path for full bundle comparison + plan details. */
export const BUNDLE_PAGE_PATH = "/bundle";

/** Table rows: included / not / custom text per plan (aligned with PLAN_DEFINITIONS). */
export type BundleComparisonCell = "yes" | "no" | string;

export interface BundleComparisonRow {
  id: string;
  label: string;
  values: Record<PlanId, BundleComparisonCell>;
}

export const BUNDLE_COMPARISON_ROWS: BundleComparisonRow[] = [
  // Keep in sync with PLAN_DEFINITIONS (start / growth / full).
  {
    id: "store",
    label: "Онлайн магазин (абонамент, темплейт, поръчки, Meta Pixel)",
    values: { start: "yes", growth: "yes", full: "yes" },
  },
  {
    id: "hosting-ssl",
    label: "Хостинг и SSL сертификат",
    values: { start: "yes", growth: "yes", full: "yes" },
  },
  {
    id: "payments",
    label: "Плащане с карта (Stripe)",
    values: { start: "no", growth: "yes", full: "yes" },
  },
  {
    id: "courier",
    label: "Интеграция с куриер (Еконт или Спиди)",
    values: { start: "no", growth: "yes", full: "yes" },
  },
  {
    id: "social",
    label: "Социални мрежи - активни канали",
    values: { start: "1 канал", growth: "2 канала", full: "2 канала" },
  },
  {
    id: "google",
    label: "Google Business - базова настройка на профил",
    values: { start: "no", growth: "no", full: "yes" },
  },
  {
    id: "discount",
    label: "Отстъпка от месечния абонамент",
    values: { start: "0%", growth: "10%", full: "15%" },
  },
];
