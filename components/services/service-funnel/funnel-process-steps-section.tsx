"use client";

import { useRef } from "react";
import {
  ArrowRight,
  ChevronDown,
  FileCheck,
  Lightbulb,
  Rocket,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import {
  funnelWaveFills,
  SectionWave,
} from "@/components/services/service-funnel/section-wave";
import type { ServiceFunnelPasConfig } from "@/config/service-funnels/types";
import { cn } from "@/lib/utils";

type FunnelProcessStepsSectionProps = {
  config: ServiceFunnelPasConfig;
  ctaHref?: string;
};

const VERTICAL_STEP_ICONS: LucideIcon[] = [Sparkles, Users, FileCheck, Lightbulb, Rocket];

/** Mint → purple accent progression; stays on-brand without going near-black */
const VERTICAL_STEP_ACCENTS = [
  "linear-gradient(160deg, oklch(0.9 0.11 155) 0%, oklch(0.62 0.14 320) 100%)",
  "linear-gradient(160deg, oklch(0.82 0.12 155) 0%, oklch(0.54 0.15 320) 100%)",
  "linear-gradient(160deg, oklch(0.72 0.13 155) 0%, oklch(0.48 0.16 320) 100%)",
  "linear-gradient(160deg, oklch(0.58 0.15 320) 0%, oklch(0.42 0.16 320) 100%)",
  "linear-gradient(160deg, oklch(0.48 0.16 320) 0%, oklch(0.34 0.16 320) 100%)",
] as const;

function ProcessStepConnector({ accent }: { accent: string }) {
  return (
    <div aria-hidden className="flex justify-center py-1.5 md:py-2">
      <div className="flex flex-col items-center">
        <span className="h-3 w-px rounded-full bg-linear-to-b from-transparent via-accent/40 to-accent/60 md:h-4" />
        <span
          className="relative z-10 -my-px flex size-7 items-center justify-center rounded-full text-white shadow-sm ring-2 ring-[color-mix(in_oklch,var(--muted)_30%,var(--background))] md:size-8"
          style={{ background: accent }}
        >
          <ChevronDown className="size-3.5 md:size-4" strokeWidth={2.75} />
        </span>
        <span className="h-3 w-px rounded-full bg-linear-to-b from-accent/60 via-accent/30 to-transparent md:h-4" />
      </div>
    </div>
  );
}

function resolveStepGridClass(stepCount: number): string {
  if (stepCount >= 5) {
    return "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";
  }
  if (stepCount === 4) {
    return "md:grid-cols-2 lg:grid-cols-4";
  }
  return "md:grid-cols-2";
}

function VerticalProcessSteps({
  steps,
}: {
  steps: ServiceFunnelPasConfig["processSteps"]["steps"];
}) {
  return (
    <ol className="mx-auto flex max-w-3xl flex-col">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const Icon = VERTICAL_STEP_ICONS[index] ?? Sparkles;
        const accent =
          VERTICAL_STEP_ACCENTS[index] ??
          VERTICAL_STEP_ACCENTS[VERTICAL_STEP_ACCENTS.length - 1];
        const nextAccent =
          VERTICAL_STEP_ACCENTS[index + 1] ??
          VERTICAL_STEP_ACCENTS[VERTICAL_STEP_ACCENTS.length - 1];

        return (
          <li key={step.title}>
            <article className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[var(--shadow-soft)] ring-1 ring-foreground/[0.03] transition-shadow duration-300 hover:shadow-[var(--shadow-glow)] md:rounded-3xl">
              <div
                aria-hidden
                className="absolute inset-y-0 left-0 w-1.5 md:w-2"
                style={{ background: accent }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/5 blur-3xl transition-opacity duration-300 group-hover:bg-primary/10"
              />

              <div className="relative flex items-start gap-4 p-5 md:gap-5 md:p-7">
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md md:size-14"
                  style={{ background: accent }}
                >
                  <Icon className="size-5 md:size-6" strokeWidth={2.2} aria-hidden />
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className="font-heading font-bold leading-snug text-foreground">
                    <span className="text-lg md:text-xl">{index + 1}.</span>{" "}
                    <span className="text-base font-semibold md:text-lg">{step.title}</span>
                  </h3>
                  <p className="mt-0.5 text-sm leading-snug text-muted-foreground md:text-base">
                    {step.description}
                  </p>
                </div>
              </div>
            </article>

            {!isLast ? <ProcessStepConnector accent={nextAccent} /> : null}
          </li>
        );
      })}
    </ol>
  );
}

function GridProcessSteps({
  steps,
}: {
  steps: ServiceFunnelPasConfig["processSteps"]["steps"];
}) {
  const stepCount = steps.length;

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

      <ol
        className={cn(
          "relative grid divide-y divide-border/50 md:divide-x md:divide-y-0",
          resolveStepGridClass(stepCount),
        )}
      >
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;

          return (
            <li key={step.title}>
              <article
                className={cn(
                  "relative h-full p-8 md:p-10",
                  isLast &&
                    "bg-gradient-to-br from-primary/20 via-primary/10 to-accent/[0.08] lg:shadow-[-12px_0_32px_-20px_oklch(0.32_0.16_320_/_0.18)]",
                )}
              >
                <div className="relative z-10">
                  <span
                    aria-hidden
                    className="block font-heading text-5xl font-bold leading-none text-foreground/15 md:text-6xl"
                  >
                    0{index + 1}
                  </span>
                  <h3 className="mt-3 font-heading text-xl font-bold text-foreground md:text-2xl">
                    {step.title}
                  </h3>

                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function FunnelProcessStepsSection({ config, ctaHref }: FunnelProcessStepsSectionProps) {
  const { processSteps, hero } = config;
  const sectionRef = useRef<HTMLElement>(null);
  const stepCount = processSteps.steps.length;
  const useVerticalLayout = stepCount >= 5;

  useSectionScrollAnimations(sectionRef, { staggerReveal: 0.08 });

  return (
    <section
      ref={sectionRef}
      id="process"
      aria-labelledby="process-steps-heading"
      className="-mt-10 bg-[color-mix(in_oklch,var(--muted)_30%,var(--background))] sm:-mt-12 md:-mt-16"
    >
      <div className="container mx-auto px-4 pb-12 pt-20 md:px-8 md:pb-16 md:pt-32">
        <header
          data-animate-reveal
          className="mx-auto max-w-2xl text-center opacity-0 translate-y-10"
        >
          <h2
            id="process-steps-heading"
            className="font-heading text-3xl font-bold tracking-tight text-balance text-foreground md:text-4xl"
          >
            {processSteps.title}
          </h2>
          {processSteps.subtitle ? (
            <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
              {processSteps.subtitle}
            </p>
          ) : null}
        </header>

        <div
          data-animate-reveal
          className={cn(
            "mx-auto opacity-0 translate-y-10",
            useVerticalLayout ? "mt-10 max-w-3xl md:mt-12" : "mt-10 max-w-6xl md:mt-12",
          )}
        >
          {useVerticalLayout ? (
            <VerticalProcessSteps steps={processSteps.steps} />
          ) : (
            <GridProcessSteps steps={processSteps.steps} />
          )}
        </div>

        {ctaHref ? (
          <div
            data-animate-reveal
            className="mx-auto mt-10 flex justify-center opacity-0 translate-y-10 md:mt-12"
          >
            <a
              href={ctaHref}
              className="group inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-accent px-10 text-lg font-semibold text-accent-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100"
            >
              {hero.ctaLabel}
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        ) : null}
      </div>
      <SectionWave fillClassName={funnelWaveFills.white} variant="smooth" />
    </section>
  );
}
