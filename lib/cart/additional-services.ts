import { getPlanComponentsForRecalc, serviceIdToPlanId } from "@/lib/data/plans";
import type { PlanId } from "@/lib/data/plans";
import { services } from "@/lib/data/services";
import type { CartItem, Service } from "@/lib/types";

export const additionalServicePrompts: Record<string, string> = {
  "ai-automation": "Искаш ли AI Automation за Instagram продажби на автопилот?",
  "ready-store": "Искаш ли онлайн магазин за 20 евро на месец?",
  "social-media": "Искаш ли редовно съдържание в профилите си?",
  ads: "Искаш ли платени реклами с управление от нас?",
  "google-business": "Искаш ли локално да достигнеш до повече клиенти?",
};

export function getIncludedServiceIds(items: CartItem[]): Set<string> {
  const ids = new Set<string>();
  for (const item of items) {
    const planId = (item.planId as PlanId | undefined) ?? serviceIdToPlanId(item.serviceId);
    if (planId) {
      for (const component of getPlanComponentsForRecalc(planId)) {
        ids.add(component.serviceId);
      }
      continue;
    }
    ids.add(item.serviceId);
  }
  return ids;
}

export function getAdditionalServices(items: CartItem[]): Service[] {
  const includedServiceIds = getIncludedServiceIds(items);
  return services.filter(
    (service) => additionalServicePrompts[service.id] && !includedServiceIds.has(service.id),
  );
}
