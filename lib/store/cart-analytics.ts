"use client";

import type { CartItemUpsell } from "@/lib/types";
import { getServiceById } from "@/lib/data/services";

function normalizeUpsells(
  serviceId: string,
  upsells: CartItemUpsell[],
): { comboKey: string; comboLabel: string } {
  const service = getServiceById(serviceId);
  const normalized = upsells
    .filter((item) => item.quantity > 0)
    .map((item) => {
      const upsell = service?.upsells.find((entry) => entry.id === item.upsellId);
      const upsellName = upsell?.name ?? item.upsellId;
      const choiceName =
        item.choiceId && upsell?.choices?.find((choice) => choice.id === item.choiceId)?.name;

      const keyParts = [item.upsellId];
      if (item.choiceId) keyParts.push(item.choiceId);
      keyParts.push(String(item.quantity));

      const label = choiceName
        ? `${upsellName} (${choiceName}) x${item.quantity}`
        : `${upsellName} x${item.quantity}`;

      return {
        sortKey: item.upsellId,
        keyPart: keyParts.join(":"),
        label,
      };
    })
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  if (normalized.length === 0) {
    return {
      comboKey: `${serviceId}__none`,
      comboLabel: "Без допълнителни услуги",
    };
  }

  const signature = normalized.map((entry) => entry.keyPart).join("|");
  return {
    comboKey: `${serviceId}__${signature}`,
    comboLabel: normalized.map((entry) => entry.label).join(" + "),
  };
}

export function recordCartAddition(
  serviceId: string,
  serviceName: string,
  upsells: CartItemUpsell[],
): void {
  if (typeof window === "undefined") return;

  const { comboKey, comboLabel } = normalizeUpsells(serviceId, upsells);

  fetch("/api/analytics/cart-additions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      serviceId,
      serviceName,
      comboKey,
      comboLabel,
      upsellCount: upsells.length,
      page: window.location.pathname,
    }),
    keepalive: true,
  })
    .then(() => {})
    .catch(() => {});
}
