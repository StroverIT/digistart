"use client";

import { useSalesStageSelection } from "@/components/services/funnel/use-sales-stage-selection";
import type { SalesStagePickerConfig } from "@/config/service-funnels/types";
import {
  saveSalesStageAnswer,
  type SalesStagePathId,
} from "@/lib/funnel/sales-stage";
import { cn } from "@/lib/utils";

type FunnelSalesStagePickerProps = {
  funnelId: string;
  picker: SalesStagePickerConfig;
};

export function FunnelSalesStagePicker({ funnelId, picker }: FunnelSalesStagePickerProps) {
  const { answer, hasAnswer } = useSalesStageSelection(funnelId);

  const handleSelect = (pathId: SalesStagePathId) => {
    saveSalesStageAnswer(funnelId, pathId);
    requestAnimationFrame(() => {
      document.getElementById("pas")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <section
      id="sales-stage-picker"
      aria-labelledby="sales-stage-picker-heading"
      className="relative z-20 scroll-mt-28 -mt-10 bg-[var(--funnel-lavender)] pt-14 pb-8 sm:-mt-12 sm:pt-16 md:-mt-16 md:pt-24 md:pb-10"
    >
      <div className="container mx-auto min-w-0 px-4 md:px-8">
        <div className="mx-auto max-w-3xl">
          <header className="mx-auto max-w-2xl text-center">
            <h2
              id="sales-stage-picker-heading"
              className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl"
            >
              {picker.title}
            </h2>
          </header>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5 md:mt-10">
            {picker.options.map((option) => {
              const isSelected = answer?.pathId === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "group relative flex min-h-[5.5rem] items-center justify-center rounded-2xl border bg-card p-6 text-center shadow-[var(--shadow-soft)] transition-all duration-300",
                    "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-glow)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                    isSelected
                      ? "border-primary/40 ring-2 ring-primary/20"
                      : "border-border/70 ring-1 ring-foreground/[0.03]",
                  )}
                >
                  <span className="font-heading text-lg font-bold text-foreground md:text-xl">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          {!hasAnswer ? (
            <p className="mt-6 text-center text-sm text-muted-foreground md:text-base">
              Избери опция, за да видиш как можем да помогнем.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
