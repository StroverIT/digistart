/** Single source of truth for ads service subscription pricing. */
export const ADS_PRICING = {
  channelManagementMonthly: 300,
  minAdBudgetMonthly: 50,
} as const;

export function formatEuroPrice(amount: number): string {
  return `€${amount}`;
}
