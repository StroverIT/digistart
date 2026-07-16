"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Flame,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import type { PathStoryBlock } from "@/lib/data/home-paths";
import { cn } from "@/lib/utils";

type StoryKey = "problem" | "agitate" | "solution";

const STEPS: {
  key: StoryKey;
  title: string;
  icon: LucideIcon;
  tone: "accent" | "muted" | "highlight";
}[] = [
  { key: "problem", title: "Проблемът", icon: AlertTriangle, tone: "accent" },
  { key: "agitate", title: "Защо е сериозно", icon: Flame, tone: "muted" },
  { key: "solution", title: "Нашето решение", icon: Lightbulb, tone: "highlight" },
];

interface PathStoryStepperProps {
  problem: PathStoryBlock;
  agitate: PathStoryBlock;
  solution: PathStoryBlock;
}

export function PathStoryStepper({ problem, agitate, solution }: PathStoryStepperProps) {
  const [active, setActive] = useState<StoryKey>("problem");

  const blocks: Record<StoryKey, PathStoryBlock> = { problem, agitate, solution };
  const activeStep = STEPS.find((s) => s.key === active)!;
  const activeBlock = blocks[active];
  const activeIndex = STEPS.findIndex((s) => s.key === active);
  const Icon = activeStep.icon;
  const isHighlight = activeStep.tone === "highlight";
  const isAccent = activeStep.tone === "accent";

  const goNext = () => {
    if (activeIndex < STEPS.length - 1) {
      setActive(STEPS[activeIndex + 1].key);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-card shadow-[var(--shadow-soft)] ring-1 ring-foreground/[0.04] md:rounded-[2.5rem]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-primary/25 blur-3xl"
      />

      <div className="relative p-6 md:p-8">
        {/* Step navigation */}
        <div className="flex gap-2 md:gap-3" role="tablist" aria-label="История на пътя">
          {STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = step.key === active;
            const isPast = idx < activeIndex;

            return (
              <button
                key={step.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(step.key)}
                className={cn(
                  "group relative flex flex-1 flex-col items-center gap-2 rounded-2xl border px-3 py-4 transition-all duration-300 md:px-4",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                    : isPast
                      ? "border-accent/30 bg-accent/5 text-foreground hover:border-accent/50"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.15em]",
                    isActive ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  0{idx + 1}
                </span>
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : isPast
                        ? "bg-accent/15 text-accent"
                        : "bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent",
                  )}
                >
                  <StepIcon className="h-4 w-4" strokeWidth={2.2} />
                </div>
                <span className="hidden text-center text-xs font-semibold leading-tight sm:block md:text-sm">
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-border/50">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${((activeIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Active content panel */}
        <article
          key={active}
          className={cn(
            "mt-6 animate-in fade-in slide-in-from-bottom-2 rounded-2xl p-6 duration-300 md:p-8",
            isHighlight
              ? "bg-gradient-to-br from-primary/20 via-primary/10 to-accent/[0.08]"
              : "bg-muted/30",
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-md ring-4 ring-card",
                isHighlight || isAccent
                  ? "bg-accent text-accent-foreground"
                  : "bg-accent/10 text-accent",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2.2} />
            </div>

            <div className="min-w-0 flex-1">
              <h3
                className={cn(
                  "text-xl font-bold md:text-2xl",
                  isAccent ? "font-accent text-accent" : "font-heading text-foreground",
                )}
              >
                {activeStep.title}
              </h3>
              <p className="mt-2 text-base font-medium text-foreground md:text-lg">
                {activeBlock.headline}
              </p>
            </div>

            {activeBlock.stat && (
              <div className="hidden shrink-0 text-right sm:block">
                <div className="font-heading text-3xl font-bold text-accent md:text-4xl">
                  {activeBlock.stat.value}
                </div>
                <div className="mt-0.5 max-w-[8rem] text-xs leading-snug text-muted-foreground">
                  {activeBlock.stat.label}
                </div>
              </div>
            )}
          </div>

          {activeBlock.stat && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-card/60 px-4 py-3 sm:hidden">
              <span className="font-heading text-2xl font-bold text-accent">
                {activeBlock.stat.value}
              </span>
              <span className="text-sm text-muted-foreground">{activeBlock.stat.label}</span>
            </div>
          )}

          <ul className="mt-5 space-y-2.5">
            {activeBlock.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-sm md:text-base">
                <span
                  className={cn(
                    "mt-2 h-1.5 w-1.5 shrink-0 rounded-full",
                    isHighlight ? "bg-accent" : "bg-foreground/40",
                  )}
                />
                <span className="text-foreground/85 leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>

          {activeIndex < STEPS.length - 1 && (
            <button
              type="button"
              onClick={goNext}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-all hover:gap-3 hover:shadow-[var(--shadow-glow)]"
            >
              Напред
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </article>
      </div>
    </div>
  );
}
