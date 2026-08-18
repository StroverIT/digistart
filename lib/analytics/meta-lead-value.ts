/**
 * Predicted Lead values in META_CURRENCY for Meta Pixel + Conversions API.
 *
 * Meta requires a numeric `value` greater than 0 on Lead events. Empty string,
 * missing, or 0 is rejected and blocks ROAS calculation.
 *
 * These are estimated opportunity values (not charged amounts), so Ads can
 * optimize toward higher-intent leads.
 *
 * @see https://www.facebook.com/business/help/392174274295227
 */
export const META_LEAD_VALUE = {
  /** Newsletter / waitlist email capture */
  emailCapture: 9.99,
  /** Free download, tips, or niche request */
  freeResource: 29,
  /** High-intent form with phone / company */
  qualifiedForm: 79,
  /** Booked consultation (matches advertised list price) */
  consultation: 138,
} as const;

export const META_DEFAULT_LEAD_VALUE = META_LEAD_VALUE.emailCapture;

/** Meta rejects missing, 0, and non-numeric Lead values. */
export function resolveMetaLeadValue(value?: number): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value * 100) / 100;
  }
  return META_DEFAULT_LEAD_VALUE;
}
