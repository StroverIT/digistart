"use client";

import { useState } from "react";
import { Check, Clock, Sparkles, Target, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const FIT_ICONS: LucideIcon[] = [Target, Clock, Users, Sparkles];

interface PathFitChecklistProps {
  fitTitle: string;
  fits: { title: string; description: string }[];
}

function splitFitTitle(fitTitle: string) {
  const question = fitTitle.match(/Това ти ли си\?/)?.[0];
  const lead = fitTitle.replace(/\s*Това ти ли си\?\s*$/, "").replace(/\.$/, "").trim();

  return {
    lead: lead || fitTitle,
    question: question ?? fitTitle,
  };
}

export function PathFitChecklist({ fitTitle, fits }: PathFitChecklistProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const { lead, question } = splitFitTitle(fitTitle);

  const toggle = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const count = selected.size;
  const threshold = Math.ceil(fits.length / 2);

  return (
    <div className="relative px-1 pt-4 md:px-4 md:pt-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {lead}
        </span>
        <h3 className="mt-5 font-heading text-2xl font-bold text-foreground md:text-3xl">
          {question}
        </h3>
        <p className="mt-3 text-sm text-muted-foreground">
          Маркирай критериите, които ти пасват
        </p>
      </div>

      {count > 0 && (
        <div
          className={cn(
            "mx-auto mt-6 max-w-md animate-in fade-in slide-in-from-bottom-2 rounded-2xl px-5 py-3 text-center text-sm font-medium duration-300",
            count >= threshold
              ? "bg-accent/10 text-accent ring-1 ring-accent/20"
              : "bg-muted text-muted-foreground",
          )}
        >
          {count >= threshold ? (
            <>
              <span className="font-bold">{count} от {fits.length}</span> критерия ти пасват — изглежда си на правилното място.
            </>
          ) : (
            <>
              Избрал си <span className="font-bold">{count} от {fits.length}</span> — маркирай още, за да видиш дали сме добър match.
            </>
          )}
        </div>
      )}

      <div className="relative mt-8 grid gap-3 pt-2 sm:grid-cols-2">
        {fits.map((fit, index) => {
          const Icon = FIT_ICONS[index % FIT_ICONS.length];
          const isSelected = selected.has(index);

          return (
            <button
              key={fit.title}
              type="button"
              onClick={() => toggle(index)}
              aria-pressed={isSelected}
              className={cn(
                "group relative overflow-visible rounded-2xl p-5 text-left transition-all duration-300 md:p-6",
                isSelected
                  ? "bg-accent/10 shadow-[var(--shadow-glow)] ring-2 ring-accent"
                  : "bg-card shadow-[var(--shadow-soft)] ring-1 ring-foreground/[0.04] hover:-translate-y-0.5 hover:ring-accent/30",
              )}
            >
              <div
                aria-hidden
                className={cn(
                  "absolute inset-y-0 left-0 w-1 rounded-l-2xl transition-colors",
                  isSelected ? "bg-accent" : "bg-border",
                )}
              />

              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "bg-accent/10 text-accent group-hover:bg-accent/15",
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.2} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-[0.18em]",
                        isSelected ? "text-accent" : "text-muted-foreground",
                      )}
                    >
                      0{index + 1}
                    </span>
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300",
                        isSelected
                          ? "bg-accent text-accent-foreground scale-100"
                          : "bg-muted text-muted-foreground scale-90 opacity-0 group-hover:opacity-100",
                      )}
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </div>
                  </div>
                  <h4 className="mt-0.5 font-heading text-base font-bold leading-snug text-foreground">
                    {fit.title}
                  </h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {fit.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
