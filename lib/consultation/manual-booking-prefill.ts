export type TManualBookingPrefillInput = {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
};

export type TManualBookingPrefillParsed = TManualBookingPrefillInput & {
  key: string;
};

export const MANUAL_BOOKING_PATH = "/admin/consultations";

export function buildManualBookingHref(prefill: TManualBookingPrefillInput) {
  const params = new URLSearchParams({
    tab: "manual",
    name: prefill.name.trim(),
    email: prefill.email.trim(),
  });

  const phone = prefill.phone?.trim();
  if (phone) params.set("phone", phone);

  const notes = prefill.notes?.trim();
  if (notes) params.set("notes", notes);

  return `${MANUAL_BOOKING_PATH}?${params.toString()}`;
}

export function parseManualBookingPrefillFromSearchParams(
  params: URLSearchParams,
): TManualBookingPrefillParsed | null {
  const name = params.get("name")?.trim() ?? "";
  const email = params.get("email")?.trim() ?? "";
  if (!name || !email) return null;

  const phone = params.get("phone")?.trim();
  const notes = params.get("notes")?.trim();

  return {
    key: `url-${name}-${email}-${Date.now()}`,
    name,
    email,
    phone: phone || undefined,
    notes: notes || undefined,
  };
}

export function isManualBookingTab(value: string | null): value is "manual" {
  return value === "manual";
}
