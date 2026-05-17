import type { PlanId } from "@/lib/data/plans";
import { getPlanTotals } from "@/lib/data/plans";

export function calculatePlanTotal(planId: PlanId): {
  listMonthly: number;
  monthlyTotal: number;
  oneTimeTotal: number;
  total: number;
  discountPercent: number;
} {
  const totals = getPlanTotals(planId);
  return {
    ...totals,
    total: totals.monthlyTotal + totals.oneTimeTotal,
  };
}
