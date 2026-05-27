import type { CartBillingCycle, CartItemUpsell } from "@/lib/types";
import { getServiceById } from "@/lib/data/services";

export const ANNUAL_PREPAY_DISCOUNT_RATE = 0.2;

export interface ItemTotalCalculation {
  total: number;
  isMonthly: boolean;
  oneTimeTotal: number;
  monthlyTotal: number;
  billingCycle: CartBillingCycle;
  annualPrepaySubtotal?: number;
  annualDiscountAmount?: number;
  annualDiscountRate?: number;
}

function roundCurrency(amount: number) {
  return Math.round(amount * 100) / 100;
}

export function calculateItemTotal(
  serviceId: string,
  optionId: string,
  upsells: CartItemUpsell[],
  billingCycle: CartBillingCycle = "monthly",
): ItemTotalCalculation {
  const service = getServiceById(serviceId);
  if (!service) {
    return { total: 0, isMonthly: false, oneTimeTotal: 0, monthlyTotal: 0, billingCycle: "monthly" };
  }

  const option = service.options.find((o) => o.id === optionId);
  if (!option) {
    return { total: 0, isMonthly: false, oneTimeTotal: 0, monthlyTotal: 0, billingCycle: "monthly" };
  }

  let oneTimeTotal = option.isMonthly ? 0 : option.price;
  let monthlyTotal = option.isMonthly ? option.price : 0;

  for (const upsellItem of upsells) {
    const serviceUpsell = service.upsells.find((u) => u.id === upsellItem.upsellId);
    if (!serviceUpsell || upsellItem.quantity <= 0) continue;

    const isChoice = serviceUpsell.kind === "choice" && serviceUpsell.choices?.length;
    if (isChoice) {
      const selectedChoice = serviceUpsell.choices!.find((c) => c.id === upsellItem.choiceId);
      if (!selectedChoice) continue;
      const upsellAmount = selectedChoice.pricePerUnit * upsellItem.quantity;
      if (selectedChoice.isMonthly) monthlyTotal += upsellAmount;
      else oneTimeTotal += upsellAmount;
      continue;
    }

    const includedUnits = serviceUpsell.includedUnits ?? 0;
    const billableUnits = Math.max(0, upsellItem.quantity - includedUnits);
    let upsellAmount = 0;

    if (serviceUpsell.tierStep && serviceUpsell.tierPrice) {
      upsellAmount = Math.ceil(billableUnits / serviceUpsell.tierStep) * serviceUpsell.tierPrice;
    } else {
      upsellAmount = (serviceUpsell.pricePerUnit ?? 0) * billableUnits;
    }

    if (serviceUpsell.isMonthly) monthlyTotal += upsellAmount;
    else oneTimeTotal += upsellAmount;
  }

  if (billingCycle === "annual-prepaid" && monthlyTotal > 0) {
    const annualPrepaySubtotal = roundCurrency(oneTimeTotal + monthlyTotal * 12);
    const annualDiscountAmount = roundCurrency(
      annualPrepaySubtotal * ANNUAL_PREPAY_DISCOUNT_RATE,
    );
    const prepaidTotal = roundCurrency(annualPrepaySubtotal - annualDiscountAmount);
    return {
      total: prepaidTotal,
      isMonthly: false,
      oneTimeTotal: prepaidTotal,
      monthlyTotal: 0,
      billingCycle: "annual-prepaid",
      annualPrepaySubtotal,
      annualDiscountAmount,
      annualDiscountRate: ANNUAL_PREPAY_DISCOUNT_RATE,
    };
  }

  return {
    total: oneTimeTotal + monthlyTotal,
    isMonthly: option.isMonthly || false,
    oneTimeTotal,
    monthlyTotal,
    billingCycle: "monthly",
  };
}
