import {
  getPlanById,
  getPlanComponentsForRecalc,
  serviceIdToPlanId,
  type PlanId,
} from "@/lib/data/plans";
import { calculatePlanTotal } from "@/lib/pricing/calculate-plan-total";
import {
  calculateItemTotal,
  type ItemTotalCalculation,
} from "@/lib/pricing/calculate-item-total";
import type { Cart, CartBillingCycle, CartItem, CartItemUpsell } from "@/lib/types";
import { getServiceById } from "@/lib/data/services";

function planCartUpsellExtras(planId: PlanId, userUpsells: CartItemUpsell[]): {
  oneTimeTotal: number;
  monthlyTotal: number;
} {
  let oneTimeTotal = 0;
  let monthlyTotal = 0;
  const components = getPlanComponentsForRecalc(planId);
  const consumedUpsellIds = new Set<string>();

  for (const component of components) {
    const service = getServiceById(component.serviceId);
    if (!service) continue;
    const builtIn = component.upsells;
    const builtInIds = new Set(builtIn.map((upsell) => upsell.upsellId));
    const extras = userUpsells.filter(
      (upsell) =>
        !consumedUpsellIds.has(upsell.upsellId) &&
        service.upsells.some((serviceUpsell) => serviceUpsell.id === upsell.upsellId) &&
        !builtInIds.has(upsell.upsellId),
    );
    if (extras.length === 0) continue;
    for (const upsell of extras) consumedUpsellIds.add(upsell.upsellId);
    const base = calculateItemTotal(component.serviceId, component.optionId, builtIn);
    const withExtras = calculateItemTotal(component.serviceId, component.optionId, [
      ...builtIn,
      ...extras,
    ]);
    oneTimeTotal += withExtras.oneTimeTotal - base.oneTimeTotal;
    monthlyTotal += withExtras.monthlyTotal - base.monthlyTotal;
  }

  return { oneTimeTotal, monthlyTotal };
}

export function recalculateCartItemPricing(params: {
  id: string;
  serviceId: string;
  selectedOptionId: string;
  upsells: CartItemUpsell[];
  billingCycle?: CartBillingCycle;
  planId?: string;
}): CartItem | null {
  const planId =
    (params.planId as PlanId | undefined) ??
    serviceIdToPlanId(params.serviceId) ??
    undefined;

  let totals: ItemTotalCalculation;
  let serviceName: string;
  let selectedOptionName: string;
  let basePrice: number;

  if (planId != null) {
    const plan = getPlanById(planId);
    if (!plan) return null;

    const planTotals = calculatePlanTotal(planId);
    const extra = planCartUpsellExtras(planId, params.upsells);
    const oneTimeTotal = planTotals.oneTimeTotal + extra.oneTimeTotal;
    const monthlyTotal = planTotals.monthlyTotal + extra.monthlyTotal;
    totals = {
      total: oneTimeTotal + monthlyTotal,
      isMonthly: true,
      oneTimeTotal,
      monthlyTotal,
      billingCycle: "monthly",
    };
    serviceName = `Пакет ${plan.name}`;
    selectedOptionName = plan.name;
    basePrice = planTotals.monthlyTotal;
  } else {
    const service = getServiceById(params.serviceId);
    if (!service) return null;

    const option = service.options.find((entry) => entry.id === params.selectedOptionId);
    if (!option) return null;

    totals = calculateItemTotal(
      params.serviceId,
      params.selectedOptionId,
      params.upsells,
      params.billingCycle ?? "monthly",
    );
    serviceName = service.name;
    selectedOptionName = option.name;
    basePrice = option.price;
  }

  return {
    id: params.id,
    planId: planId ?? undefined,
    serviceId: params.serviceId,
    serviceName,
    selectedOptionId: params.selectedOptionId,
    selectedOptionName,
    basePrice,
    upsells: params.upsells,
    totalPrice: totals.total,
    totalOneTime: totals.oneTimeTotal,
    totalMonthly: totals.monthlyTotal,
    isMonthly: totals.isMonthly,
    billingCycle: totals.billingCycle,
    annualPrepaySubtotal: totals.annualPrepaySubtotal,
    annualDiscountAmount: totals.annualDiscountAmount,
    annualDiscountRate: totals.annualDiscountRate,
  };
}

export function recalculateCartTotals(items: CartItem[]): Cart {
  return {
    items,
    totalOneTime: items.reduce((sum, item) => sum + (item.totalOneTime ?? 0), 0),
    totalMonthly: items.reduce((sum, item) => sum + (item.totalMonthly ?? 0), 0),
  };
}

export type CartItemSelectionInput = Pick<
  CartItem,
  "id" | "serviceId" | "selectedOptionId" | "upsells"
> & {
  billingCycle?: CartBillingCycle;
  planId?: string;
};

export function recalculateCartFromSelections(items: CartItemSelectionInput[]): Cart | null {
  const pricedItems: CartItem[] = [];
  for (const item of items) {
    const priced = recalculateCartItemPricing(item);
    if (!priced) return null;
    pricedItems.push(priced);
  }
  return recalculateCartTotals(pricedItems);
}
