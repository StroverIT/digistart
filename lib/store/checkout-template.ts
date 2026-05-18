import type { ProductCategory } from "@/lib/data/templates";

export const CHECKOUT_TEMPLATE_STORAGE_KEY = "digistart-checkout-template";

export type CheckoutTemplateSelection = {
  category: ProductCategory;
  id: string;
};

export function getCheckoutTemplateSelection(): CheckoutTemplateSelection | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CHECKOUT_TEMPLATE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CheckoutTemplateSelection;
    if (parsed?.category && parsed?.id) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function setCheckoutTemplateSelection(selection: CheckoutTemplateSelection): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHECKOUT_TEMPLATE_STORAGE_KEY, JSON.stringify(selection));
}

export function clearCheckoutTemplateSelection(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CHECKOUT_TEMPLATE_STORAGE_KEY);
}
