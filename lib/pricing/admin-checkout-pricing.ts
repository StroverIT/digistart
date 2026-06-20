import type { Cart, CartItem } from "@/lib/types";
import type { ItemTotalCalculation } from "@/lib/pricing/calculate-item-total";

/** Flat order total when an admin is logged in (regardless of cart size or upsells). */
export const ADMIN_CHECKOUT_TOTAL_EUR = 1;

/** @deprecated Use ADMIN_CHECKOUT_TOTAL_EUR */
export const ADMIN_CHECKOUT_ITEM_PRICE_EUR = ADMIN_CHECKOUT_TOTAL_EUR;

export function isAdminCheckoutRole(role?: string | null): boolean {
  return role === "admin";
}

export function adminItemTotals(): ItemTotalCalculation {
  return {
    total: ADMIN_CHECKOUT_TOTAL_EUR,
    isMonthly: false,
    oneTimeTotal: ADMIN_CHECKOUT_TOTAL_EUR,
    monthlyTotal: 0,
    billingCycle: "monthly",
  };
}

/** Assigns the full admin total to the first line item for Stripe; others are €0. */
export function applyAdminPricingToCartItem(item: CartItem, index: number): CartItem {
  const isFirstItem = index === 0;
  return {
    ...item,
    totalPrice: isFirstItem ? ADMIN_CHECKOUT_TOTAL_EUR : 0,
    totalOneTime: isFirstItem ? ADMIN_CHECKOUT_TOTAL_EUR : 0,
    totalMonthly: 0,
    isMonthly: false,
    billingCycle: "monthly",
    annualPrepaySubtotal: undefined,
    annualDiscountAmount: undefined,
    annualDiscountRate: undefined,
  };
}

export function applyAdminPricingToCart(cart: Cart): Cart {
  const items = cart.items.map(applyAdminPricingToCartItem);
  return {
    items,
    totalOneTime: cart.items.length > 0 ? ADMIN_CHECKOUT_TOTAL_EUR : 0,
    totalMonthly: 0,
  };
}

/** Preview total on a service buy panel - always the flat admin total. */
export function adminPreviewTotalPrice(): number {
  return ADMIN_CHECKOUT_TOTAL_EUR;
}
