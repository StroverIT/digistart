"use client";

import type { Cart, CartItem, CartItemUpsell } from "@/lib/types";
import { getServiceById } from "@/lib/data/services";
import { calculateItemTotal } from "@/lib/pricing/calculate-item-total";
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
  upsells: CartItemUpsell[]
): AddToCartResult {
  const cart = getCart();
  const service = getServiceById(serviceId);
  if (!service) return { cart, added: false, reason: "invalid" };

  if (cart.items.some((item) => item.serviceId === serviceId)) {
    return { cart, added: false, reason: "duplicate" };
  }

  const option = service.options.find((o) => o.id === optionId);
  if (!option) return { cart, added: false, reason: "invalid" };

  const { total, isMonthly, oneTimeTotal, monthlyTotal } = calculateItemTotal(
    serviceId,
    optionId,
    upsells
  );

  const newItem: CartItem = {
    id: `${serviceId}-${optionId}-${Date.now()}`,
    serviceId,
    serviceName: service.name,
    selectedOptionId: optionId,
    selectedOptionName: option.name,
    basePrice: option.price,
    upsells,
    totalPrice: total,
    totalOneTime: oneTimeTotal,
    totalMonthly: monthlyTotal,
    isMonthly,
  };

  cart.items.push(newItem);
  recalculateTotals(cart);
  saveCart(cart);
  recordCartAddition(serviceId, service.name, upsells);

  return { cart, added: true };
}

export function removeFromCart(itemId: string): Cart {
  const cart = getCart();
  cart.items = cart.items.filter((item) => item.id !== itemId);
  recalculateTotals(cart);
  saveCart(cart);
  return cart;
}

export function updateCartItemUpsells(itemId: string, upsells: CartItemUpsell[]): Cart {
  const cart = getCart();
  const item = cart.items.find((cartItem) => cartItem.id === itemId);
  if (!item) return cart;

  const totals = calculateItemTotal(item.serviceId, item.selectedOptionId, upsells);
  item.upsells = upsells;
  item.totalPrice = totals.total;
  item.totalOneTime = totals.oneTimeTotal;
  item.totalMonthly = totals.monthlyTotal;
  item.isMonthly = totals.isMonthly;

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
  cart.totalOneTime = cart.items.reduce((sum, item) => sum + (item.totalOneTime ?? 0), 0);
  cart.totalMonthly = cart.items.reduce((sum, item) => sum + (item.totalMonthly ?? 0), 0);
}

export function getCartItemCount(): number {
  const cart = getCart();
  return cart.items.length;
}
