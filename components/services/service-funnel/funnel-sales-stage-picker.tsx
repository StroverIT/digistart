"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSalesStageSelection } from "@/components/services/funnel/use-sales-stage-selection";
import type { SalesStagePickerConfig } from "@/config/service-funnels/types";
import {
  hasSalesStageAnswer,
  saveSalesStageAnswer,
  type SalesStagePathId,
} from "@/lib/funnel/sales-stage";
import { trackFunnelSalesStageSelection } from "@/lib/funnel/sales-stage-analytics";
import { cn } from "@/lib/utils";

type FunnelSalesStagePickerProps = {
  funnelId: string;
  picker: SalesStagePickerConfig;
  pagePath?: string;
};

export function FunnelSalesStagePicker({ funnelId, picker, pagePath }: FunnelSalesStagePickerProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const { hydrated } = useSalesStageSelection(funnelId);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hydrated && !hasSalesStageAnswer(funnelId)) {
      setVisible(true);
    }
  }, [funnelId, hydrated]);

  useEffect(() => {
    if (!visible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  const handleSelect = (pathId: SalesStagePathId) => {
    if (!isAdmin) {
      trackFunnelSalesStageSelection({
        funnelId,
        pathId,
        page: pagePath,
      });
    }

    saveSalesStageAnswer(funnelId, pathId);
    setVisible(false);
    requestAnimationFrame(() => {
      document.getElementById("pas")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sales-stage-picker-heading"
    >
      <div
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-md motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl shadow-indigo-500/10 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-300">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-[var(--funnel-lavender)]/80 to-transparent" />

        <div className="relative px-5 pb-6 pt-7 sm:px-8 sm:pb-8 sm:pt-9">
          <header className="text-center">
            <h2
              id="sales-stage-picker-heading"
              className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              {picker.title}
            </h2>
          </header>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 sm:gap-5">
            {picker.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                className={cn(
                  "group relative flex min-h-[5.5rem] items-center justify-center rounded-2xl border bg-card p-6 text-center shadow-[var(--shadow-soft)] transition-all duration-300",
                  "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-glow)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  "border-border/70 ring-1 ring-foreground/[0.03]",
                )}
              >
                <span className="font-heading text-lg font-bold text-foreground md:text-xl">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
