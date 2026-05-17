export type PlanId = "start" | "growth" | "full";

export interface PlanLineItem {
  label: string;
  monthlyAmount: number;
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

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

const START_LIST = 220;
const GROWTH_LIST = 334;
const FULL_LIST = 334;

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "start",
    name: "Старт",
    tagline: "Онлайн магазин + 1 социален канал",
    description:
      "Идеален за първа стъпка онлайн: готов магазин с шаблон и базово присъствие в социалните мрежи.",
    discountPercent: 0,
    listMonthly: START_LIST,
    monthlyTotal: START_LIST,
    oneTimeTotal: 0,
    features: [
      "Абонаментен онлайн магазин (шаблон, поръчки, Meta Pixel)",
      "1 канал в социалните мрежи (2 публикации седмично)",
      "Настройка за 1 работен ден",
    ],
    lineItems: [
      { label: "Онлайн магазин", monthlyAmount: 20 },
      { label: "Социални мрежи (1 канал)", monthlyAmount: 200 },
    ],
  },
  {
    id: "growth",
    name: "Растеж",
    tagline: "Плащания, куриер и 2 канала",
    description:
      "Разширен пакет с онлайн плащания, доставка и два социални канала — с 10% отстъпка.",
    discountPercent: 10,
    listMonthly: GROWTH_LIST,
    monthlyTotal: roundMoney(GROWTH_LIST * 0.9),
    oneTimeTotal: 0,
    highlighted: true,
    features: [
      "Всичко от Старт, плюс плащания с карта",
      "1 куриер по избор (Еконт или Спиди)",
      "2 канала в социалните мрежи",
      "10% отстъпка от месечната цена",
    ],
    lineItems: [
      { label: "Онлайн магазин", monthlyAmount: 20 },
      { label: "Плащания с карта", monthlyAmount: 10 },
      { label: "Куриер (1)", monthlyAmount: 5 },
      { label: "Социални мрежи (2 канала)", monthlyAmount: 299 },
    ],
  },
  {
    id: "full",
    name: "Пълен",
    tagline: "Растеж + Google Business",
    description:
      "Пълен дигитален пакет с Google Business профил и 15% отстъпка от месечната цена.",
    discountPercent: 15,
    listMonthly: FULL_LIST,
    monthlyTotal: roundMoney(FULL_LIST * 0.85),
    oneTimeTotal: 20,
    features: [
      "Всичко от Растеж",
      "Google Business — базова настройка на профила (еднократно)",
      "15% отстъпка от месечната цена",
    ],
    lineItems: [
      { label: "Онлайн магазин + плащания + куриер", monthlyAmount: 35 },
      { label: "Социални мрежи (2 канала)", monthlyAmount: 299 },
      { label: "Google Business (настройка)", monthlyAmount: 0 },
    ],
  },
];

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
