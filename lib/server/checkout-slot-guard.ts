import { isBundlePlanServiceId } from "@/lib/server/bundle-plans";
import { getFunnelSlotAvailability, isKnownFunnelId } from "@/lib/server/funnel-slots";
import { getServiceSlotAvailability } from "@/lib/server/service-slots";
import type { Cart } from "@/lib/types";

/** Returns an error message when checkout should be blocked, or null when slots are available. */
export async function getCheckoutSlotBlockReason(cart: Cart): Promise<string | null> {
  if (cart.funnelId) {
    if (!isKnownFunnelId(cart.funnelId)) {
      return "Невалидна оферта за плащане.";
    }

    const availability = await getFunnelSlotAvailability(cart.funnelId);
    if (availability?.isSoldOut) {
      return "Няма свободни места за тази оферта. Запишете се в waitlist.";
    }
    return null;
  }

  for (const item of cart.items) {
    if (isBundlePlanServiceId(item.serviceId)) continue;

    const availability = await getServiceSlotAvailability(item.serviceId);
    if (availability?.isSoldOut) {
      return `Няма свободни места за ${availability.serviceName}. Запишете се в waitlist.`;
    }
  }

  return null;
}
