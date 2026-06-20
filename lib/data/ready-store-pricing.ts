/** Single source of truth for online store (ready-store) subscription pricing. */
export const READY_STORE_PRICING = {
  baseMonthly: 29,
  cardPaymentMonthly: 8,
  courierMonthly: 5,
  bothCouriersMonthly: 10,
} as const;

export function formatEuroPrice(amount: number): string {
  return `€${amount}`;
}
