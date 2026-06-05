import { applyAdminPricingToCart } from "@/lib/pricing/admin-checkout-pricing";
import {
  recalculateCartFromSelections,
  type CartItemSelectionInput,
} from "@/lib/pricing/recalculate-cart-pricing";
import { validateCartItemSelections } from "@/lib/pricing/validate-cart-item";
import type { Cart, CartBillingCycle, CartItemUpsell } from "@/lib/types";

export type CheckoutCartItemInput = {
  id: string;
  serviceId: string;
  selectedOptionId: string;
  upsells: CartItemUpsell[];
  billingCycle?: CartBillingCycle;
  planId?: string;
};

export type ResolveCheckoutCartResult =
  | { ok: true; cart: Cart }
  | { ok: false; error: string; status: number };

/**
 * Validates cart selections and recomputes all prices server-side.
 * Client-supplied totals are ignored.
 */
export function resolveCheckoutCart(
  items: CheckoutCartItemInput[],
  options?: { isAdminCheckout?: boolean },
): ResolveCheckoutCartResult {
  if (items.length === 0) {
    return { ok: false, error: "Cart cannot be empty.", status: 400 };
  }

  const selections: CartItemSelectionInput[] = [];

  for (const item of items) {
    const validationError = validateCartItemSelections({
      serviceId: item.serviceId,
      selectedOptionId: item.selectedOptionId,
      upsells: item.upsells,
      billingCycle: item.billingCycle,
      planId: item.planId,
    });
    if (validationError) {
      return { ok: false, error: validationError, status: 400 };
    }

    selections.push({
      id: item.id,
      serviceId: item.serviceId,
      selectedOptionId: item.selectedOptionId,
      upsells: item.upsells,
      billingCycle: item.billingCycle,
      planId: item.planId,
    });
  }

  const pricedCart = recalculateCartFromSelections(selections);
  if (!pricedCart) {
    return { ok: false, error: "Неуспешно изчисление на цените.", status: 400 };
  }

  const cart = options?.isAdminCheckout
    ? applyAdminPricingToCart(pricedCart)
    : pricedCart;

  return { ok: true, cart };
}
