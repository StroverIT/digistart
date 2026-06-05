import type { CartBillingCycle, CartItemUpsell } from "@/lib/types";
import { getPlanComponentsForRecalc, getPlanById, serviceIdToPlanId, type PlanId } from "@/lib/data/plans";
import { getServiceById } from "@/lib/data/services";
import type { Service, ServiceUpsell } from "@/lib/types";

function validateUpsellConfig(
  config: ServiceUpsell,
  upsell: CartItemUpsell,
): string | null {
  if (upsell.quantity <= 0) return null;

  const min = config.min ?? 0;
  const max = config.max ?? 99;
  if (upsell.quantity < min) {
    return `Количеството за „${config.name}“ е под минимума (${min}).`;
  }
  if (upsell.quantity > max) {
    return `Количеството за „${config.name}“ е над максимума (${max}).`;
  }

  const isChoice = config.kind === "choice" && (config.choices?.length ?? 0) > 0;
  if (isChoice) {
    if (!upsell.choiceId) {
      return `Изберете опция за „${config.name}“.`;
    }
    if (!config.choices!.some((choice) => choice.id === upsell.choiceId)) {
      return `Невалидна опция за „${config.name}“.`;
    }
  }

  if (config.allowEntries) {
    const entries = upsell.entries ?? [];
    for (let index = 0; index < upsell.quantity; index += 1) {
      if (!entries[index]?.trim()) {
        return `Липсва стойност за „${config.entryLabel ?? config.name} #${index + 1}“.`;
      }
    }
  }

  return null;
}

function validateServiceUpsells(service: Service, upsells: CartItemUpsell[]): string | null {
  for (const upsell of upsells) {
    if (upsell.quantity <= 0) continue;
    const config = service.upsells.find((entry) => entry.id === upsell.upsellId);
    if (!config) {
      return `Невалидна добавка за ${service.name}.`;
    }
    const configError = validateUpsellConfig(config, upsell);
    if (configError) return configError;
  }
  return null;
}

function validatePlanUpsells(planId: PlanId, upsells: CartItemUpsell[]): string | null {
  const components = getPlanComponentsForRecalc(planId);
  const consumedUpsellIds = new Set<string>();

  for (const upsell of upsells) {
    if (upsell.quantity <= 0) continue;

    let matched = false;
    for (const component of components) {
      if (consumedUpsellIds.has(upsell.upsellId)) continue;

      const service = getServiceById(component.serviceId);
      if (!service) continue;

      const builtInIds = new Set(component.upsells.map((entry) => entry.upsellId));
      if (builtInIds.has(upsell.upsellId)) continue;

      const config = service.upsells.find((entry) => entry.id === upsell.upsellId);
      if (!config) continue;

      const configError = validateUpsellConfig(config, upsell);
      if (configError) return configError;

      consumedUpsellIds.add(upsell.upsellId);
      matched = true;
      break;
    }

    if (!matched) {
      return `Невалидна добавка за абонаментен пакет.`;
    }
  }

  return null;
}

export function validateCartItemSelections(params: {
  serviceId: string;
  selectedOptionId: string;
  upsells: CartItemUpsell[];
  billingCycle?: CartBillingCycle;
  planId?: string;
}): string | null {
  const planId =
    (params.planId as PlanId | undefined) ??
    serviceIdToPlanId(params.serviceId) ??
    undefined;

  if (planId != null) {
    if (!getPlanById(planId)) {
      return "Абонаментният пакет не е намерен.";
    }
    if (params.selectedOptionId !== planId) {
      return "Невалидна опция за абонаментен пакет.";
    }
    return validatePlanUpsells(planId, params.upsells);
  }

  const service = getServiceById(params.serviceId);
  if (!service) {
    return `Услугата не е намерена: ${params.serviceId}`;
  }

  const option = service.options.find((entry) => entry.id === params.selectedOptionId);
  if (!option) {
    return `Опцията не е намерена за ${service.name}.`;
  }

  if (params.billingCycle === "annual-prepaid" && !option.isMonthly) {
    return "Годишното предплащане не е налично за тази опция.";
  }

  return validateServiceUpsells(service, params.upsells);
}
