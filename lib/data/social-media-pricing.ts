/** Single source of truth for social media subscription pricing. */
export const SOCIAL_MEDIA_PRICING = {
  baseMonthly: 900,
  extraChannelMonthly: 99,
  onLocationShootingMonthly: 230,
} as const;

export function formatEuroPrice(amount: number): string {
  return `€${amount}`;
}
