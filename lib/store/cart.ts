"use client";

import type { Cart, CartBillingCycle, CartItem, CartItemUpsell } from "@/lib/types";
import {
  getPlanById,
  planToServiceId,
  serviceIdToPlanId,
  type PlanId,
} from "@/lib/data/plans";
import { calculatePlanTotal } from "@/lib/pricing/calculate-plan-total";
import { getServiceById } from "@/lib/data/services";
import { calculateItemTotal } from "@/lib/pricing/calculate-item-total";
import {
  recalculateCartItemPricing,
  recalculateCartTotals,
} from "@/lib/pricing/recalculate-cart-pricing";
import { recordCartAddition } from "@/lib/store/cart-analytics";

const CART_STORAGE_KEY = "digistart-cart";

export type AddToCartResult =
  | { cart: Cart; added: true }
  | { cart: Cart; added: false; reason: "duplicate" | "invalid" };

export function getCart(): Cart {
  if (typeof window === "undefined") {
    return { items: [], totalOneTime: 0, totalMonthly: 0 };
  }

  const stored = localStorage.getItem(CART_STORAGE_KEY);
  if (!stored) {
    return { items: [], totalOneTime: 0, totalMonthly: 0 };
  }

  try {
    const parsed = JSON.parse(stored) as Cart;
    parsed.items = (parsed.items ?? []).map((item) => {
      const oneTime = item.totalOneTime ?? (item.isMonthly ? 0 : item.totalPrice);
      const monthly = item.totalMonthly ?? (item.isMonthly ? item.totalPrice : 0);
      return { ...item, totalOneTime: oneTime, totalMonthly: monthly };
    });
    parsed.totalOneTime = parsed.items.reduce((sum, item) => sum + item.totalOneTime, 0);
    parsed.totalMonthly = parsed.items.reduce((sum, item) => sum + item.totalMonthly, 0);
    return parsed;
  } catch {
    return { items: [], totalOneTime: 0, totalMonthly: 0 };
  }
}

export function saveCart(cart: Cart): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("cart-updated"));
}

/** At most one line item per `serviceId` in the cart. */
export function findCartItemByService(
  serviceId: string,
  selectedOptionId?: string,
): CartItem | undefined {
  const cart = getCart();
  return cart.items.find(
    (item) =>
      item.serviceId === serviceId &&
      (selectedOptionId === undefined || item.selectedOptionId === selectedOptionId),
  );
}

export { calculateItemTotal };

export function addToCart(
  serviceId: string,
  optionId: string,
  upsells: CartItemUpsell[],
  billingCycle: CartBillingCycle = "monthly",
): AddToCartResult {
  const cart = getCart();
  const service = getServiceById(serviceId);
  if (!service) return { cart, added: false, reason: "invalid" };

  if (cart.items.some((item) => item.serviceId === serviceId)) {
    return { cart, added: false, reason: "duplicate" };
  }

  const option = service.options.find((o) => o.id === optionId);
  if (!option) return { cart, added: false, reason: "invalid" };

  const totals = calculateItemTotal(serviceId, optionId, upsells, billingCycle);

  const newItem: CartItem = {
    id: `${serviceId}-${optionId}-${Date.now()}`,
    serviceId,
    serviceName: service.name,
    selectedOptionId: optionId,
    selectedOptionName: option.name,
    basePrice: option.price,
    upsells,
    totalPrice: totals.total,
    totalOneTime: totals.oneTimeTotal,
    totalMonthly: totals.monthlyTotal,
    isMonthly: totals.isMonthly,
    billingCycle: totals.billingCycle,
    annualPrepaySubtotal: totals.annualPrepaySubtotal,
    annualDiscountAmount: totals.annualDiscountAmount,
    annualDiscountRate: totals.annualDiscountRate,
  };

  cart.items.push(newItem);
  recalculateTotals(cart);
  saveCart(cart);
  recordCartAddition(serviceId, service.name, upsells);

  return { cart, added: true };
}

export function addOrUpdateServiceInCart(
  serviceId: string,
  optionId: string,
  upsells: CartItemUpsell[],
  options?: {
    includeCompanion?: boolean;
    companionServiceId?: string;
    companionOptionId?: string;
    billingCycle?: CartBillingCycle;
  },
): AddToCartResult {
  const existing = findCartItemByService(serviceId, optionId);
  if (existing) {
    updateCartItemUpsells(existing.id, upsells, options?.billingCycle);
    if (
      options?.includeCompanion &&
      options.companionServiceId &&
      options.companionOptionId &&
      !findCartItemByService(options.companionServiceId, options.companionOptionId)
    ) {
      addToCart(
        options.companionServiceId,
        options.companionOptionId,
        [],
        options.billingCycle,
      );
    }
    return { cart: getCart(), added: false, reason: "duplicate" };
  }

  const result = addToCart(serviceId, optionId, upsells, options?.billingCycle);
  if (!result.added) return result;

  if (
    options?.includeCompanion &&
    options.companionServiceId &&
    options.companionOptionId &&
    !findCartItemByService(options.companionServiceId, options.companionOptionId)
  ) {
    addToCart(
      options.companionServiceId,
      options.companionOptionId,
      [],
      options.billingCycle,
    );
  }

  return result;
}

export function removeFromCart(itemId: string): Cart {
  const cart = getCart();
  cart.items = cart.items.filter((item) => item.id !== itemId);
  recalculateTotals(cart);
  saveCart(cart);
  return cart;
}

export function updateCartItemUpsells(
  itemId: string,
  upsells: CartItemUpsell[],
  billingCycle?: CartBillingCycle,
): Cart {
  const cart = getCart();
  const item = cart.items.find((cartItem) => cartItem.id === itemId);
  if (!item) return cart;

  const priced = recalculateCartItemPricing({
    id: item.id,
    serviceId: item.serviceId,
    selectedOptionId: item.selectedOptionId,
    upsells,
    billingCycle: billingCycle ?? item.billingCycle ?? "monthly",
    planId: item.planId,
  });
  if (!priced) return cart;

  Object.assign(item, priced);
  recalculateTotals(cart);
  saveCart(cart);
  return cart;
}

export function clearCart(): Cart {
  const emptyCart: Cart = { items: [], totalOneTime: 0, totalMonthly: 0 };
  saveCart(emptyCart);
  return emptyCart;
}

function recalculateTotals(cart: Cart): void {
  const totals = recalculateCartTotals(cart.items);
  cart.totalOneTime = totals.totalOneTime;
  cart.totalMonthly = totals.totalMonthly;
}

export function getCartItemCount(): number {
  const cart = getCart();
  return cart.items.length;
}

export function findCartItemByPlan(planId: PlanId): CartItem | undefined {
  const serviceId = planToServiceId(planId);
  return getCart().items.find((item) => item.serviceId === serviceId || item.planId === planId);
}

export function hasBundlePlanInCart(): boolean {
  return getCart().items.some((item) => item.planId || serviceIdToPlanId(item.serviceId));
}

export function hasOverlappingServicesWithPlan(planId: PlanId): string[] {
  const plan = getPlanById(planId);
  if (!plan) return [];
  const cart = getCart();
  const overlaps: string[] = [];
  const bundleServiceIds = new Set(["ready-store", "social-media", "google-business"]);
  for (const item of cart.items) {
    if (item.planId || serviceIdToPlanId(item.serviceId)) continue;
    if (bundleServiceIds.has(item.serviceId)) {
      overlaps.push(item.serviceName);
    }
  }
  return overlaps;
}

export type AddPlanToCartResult =
  | { cart: Cart; added: true }
  | { cart: Cart; added: false; reason: "duplicate" | "invalid" };

/** Replace any existing bundle plan; à la carte items may remain (checkout shows warning). */
export function addPlanToCart(planId: PlanId): AddPlanToCartResult {
  const plan = getPlanById(planId);
  if (!plan) return { cart: getCart(), added: false, reason: "invalid" };

  const cart = getCart();
  cart.items = cart.items.filter((item) => !item.planId && !serviceIdToPlanId(item.serviceId));

  const serviceId = planToServiceId(planId);
  if (cart.items.some((item) => item.serviceId === serviceId)) {
    return { cart, added: false, reason: "duplicate" };
  }

  const totals = calculatePlanTotal(planId);
  const newItem: CartItem = {
    id: `plan-${planId}-${Date.now()}`,
    planId,
    serviceId,
    serviceName: `Пакет ${plan.name}`,
    selectedOptionId: planId,
    selectedOptionName: plan.name,
    basePrice: totals.monthlyTotal,
    upsells: [],
    totalPrice: totals.monthlyTotal + totals.oneTimeTotal,
    totalOneTime: totals.oneTimeTotal,
    totalMonthly: totals.monthlyTotal,
    isMonthly: true,
  };

  cart.items.push(newItem);
  recalculateTotals(cart);
  saveCart(cart);
  recordCartAddition(serviceId, newItem.serviceName, []);

  return { cart, added: true };
}
