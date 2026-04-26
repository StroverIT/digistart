"use client";

import type { CartItemUpsell, ServiceUpsell } from "@/lib/types";

export type UpsellEntryErrors = Record<string, Record<number, string>>;

export interface UpsellValidationResult {
  isValid: boolean;
  errors: UpsellEntryErrors;
}

export function validateUpsellEntries(
  upsellConfig: ServiceUpsell[],
  selectedUpsells: CartItemUpsell[]
): UpsellValidationResult {
  const errors: UpsellEntryErrors = {};

  for (const selectedUpsell of selectedUpsells) {
    if (selectedUpsell.quantity <= 0) continue;

    const config = upsellConfig.find((upsell) => upsell.id === selectedUpsell.upsellId);
    if (!config?.allowEntries) continue;

    const entryErrors: Record<number, string> = {};
    const entries = selectedUpsell.entries ?? [];

    for (let index = 0; index < selectedUpsell.quantity; index++) {
      const value = entries[index]?.trim() ?? "";
      if (!value) {
        entryErrors[index] = `Полето "${config.entryLabel ?? "Стойност"} #${index + 1}" е задължително.`;
      }
    }

    if (Object.keys(entryErrors).length > 0) {
      errors[selectedUpsell.upsellId] = entryErrors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
