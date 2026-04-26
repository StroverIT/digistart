"use client";

import type { Cart, CartItem, CartItemUpsell } from "@/lib/types";
import { getServiceById } from "@/lib/data/services";

const CART_STORAGE_KEY = "sleek-route-cart";

export function getCart(): Cart {
  if (typeof window === "undefined") {
    return { items: [], totalOneTime: 0, totalMonthly: 0 };
  }
  
  const stored = localStorage.getItem(CART_STORAGE_KEY);
  if (!stored) {
    return { items: [], totalOneTime: 0, totalMonthly: 0 };
  }
  
  try {
    return JSON.parse(stored);
  } catch {
    return { items: [], totalOneTime: 0, totalMonthly: 0 };
  }
}

export function saveCart(cart: Cart): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("cart-updated"));
}

export function calculateItemTotal(
  serviceId: string,
  optionId: string,
  upsells: CartItemUpsell[]
): { total: number; isMonthly: boolean } {
  const service = getServiceById(serviceId);
  if (!service) return { total: 0, isMonthly: false };

  const option = service.options.find((o) => o.id === optionId);
  if (!option) return { total: 0, isMonthly: false };

  let total = option.price;

  for (const upsell of upsells) {
    const serviceUpsell = service.upsells.find((u) => u.id === upsell.upsellId);
    if (serviceUpsell) {
      total += serviceUpsell.pricePerUnit * upsell.quantity;
    }
  }

  return { total, isMonthly: option.isMonthly || false };
}

export function addToCart(
  serviceId: string,
  optionId: string,
  upsells: CartItemUpsell[]
): Cart {
  const cart = getCart();
  const service = getServiceById(serviceId);
  if (!service) return cart;

  const option = service.options.find((o) => o.id === optionId);
  if (!option) return cart;

  const { total, isMonthly } = calculateItemTotal(serviceId, optionId, upsells);

  const newItem: CartItem = {
    id: `${serviceId}-${optionId}-${Date.now()}`,
    serviceId,
    serviceName: service.name,
    selectedOptionId: optionId,
    selectedOptionName: option.name,
    basePrice: option.price,
    upsells,
    totalPrice: total,
    isMonthly,
  };

  cart.items.push(newItem);
  recalculateTotals(cart);
  saveCart(cart);

  return cart;
}

export function removeFromCart(itemId: string): Cart {
  const cart = getCart();
  cart.items = cart.items.filter((item) => item.id !== itemId);
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
  cart.totalOneTime = cart.items
    .filter((item) => !item.isMonthly)
    .reduce((sum, item) => sum + item.totalPrice, 0);
  
  cart.totalMonthly = cart.items
    .filter((item) => item.isMonthly)
    .reduce((sum, item) => sum + item.totalPrice, 0);
}

export function getCartItemCount(): number {
  const cart = getCart();
  return cart.items.length;
}
