/** Service ids that participate in slot capacity (public landing pages). */
export const SLOT_MANAGED_SERVICE_IDS = [
  "ready-store",
  "social-media",
  "ads",
  "google-business",
] as const;

export type SlotManagedServiceId = (typeof SLOT_MANAGED_SERVICE_IDS)[number];

/** Map URL slug to service id for header / pages. */
export function serviceIdFromPathSlug(pathSlug: string): SlotManagedServiceId | null {
  const map: Record<string, SlotManagedServiceId> = {
    "online-store": "ready-store",
    "social-media": "social-media",
    ads: "ads",
    "google-business": "google-business",
  };
  return map[pathSlug] ?? null;
}
