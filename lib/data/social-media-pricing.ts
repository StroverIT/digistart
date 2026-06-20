/** Single source of truth for social media subscription pricing. */
export const SOCIAL_MEDIA_PRICING = {
  baseMonthly: 790,
  extraChannelMonthly: 99,
} as const;

export function formatEuroPrice(amount: number): string {
  return `€${amount}`;
}
