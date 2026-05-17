import { Check, X } from "lucide-react";
import type { BundleComparisonCell } from "@/lib/data/plans";
import { cn } from "@/lib/utils";

export function BundleComparisonCellContent({ value }: { value: BundleComparisonCell }) {
  if (value === "yes") {
    return (
      <span className="inline-flex justify-center text-primary" aria-label="Включено">
        <Check className="h-5 w-5" strokeWidth={2.5} />
      </span>
    );
  }
  if (value === "no") {
    return (
      <span className="inline-flex justify-center text-muted-foreground/60" aria-label="Не е включено">
        <X className="h-5 w-5" />
      </span>
    );
  }
  return <span className="text-sm font-medium text-foreground tabular-nums">{value}</span>;
}

export function bundleCellClassName(value: BundleComparisonCell): string {
  return cn(
    "px-3 py-3 text-center align-middle border-border",
    value === "no" && "bg-muted/20",
    value === "yes" && "bg-primary/5",
  );
}
