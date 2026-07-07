"use client";

import { useRef } from "react";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import {
  funnelWaveFills,
  SectionWave,
} from "@/components/services/service-funnel/section-wave";
import type { ServiceFunnelPasConfig } from "@/config/service-funnels/types";
import { cn } from "@/lib/utils";

type FunnelProcessStepsSectionProps = {
  config: ServiceFunnelPasConfig;
};

export function FunnelProcessStepsSection({ config }: FunnelProcessStepsSectionProps) {
  const { processSteps } = config;
  const sectionRef = useRef<HTMLElement>(null);

  useSectionScrollAnimations(sectionRef, { staggerReveal: 0.08 });

  return (
    <section
      ref={sectionRef}
      id="process"
      aria-labelledby="process-steps-heading"
      className="-mt-10 bg-[color-mix(in_oklch,var(--muted)_30%,var(--background))] sm:-mt-12 md:-mt-16"
    >
      <div className="container mx-auto px-4 py-12 md:px-8 md:py-16">
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
          className="mx-auto mt-10 max-w-6xl opacity-0 translate-y-10 md:mt-12"
        >
          <div className="relative overflow-hidden rounded-[2rem] bg-card shadow-[var(--shadow-soft)] ring-1 ring-foreground/[0.04] md:rounded-[2.5rem]">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-primary/25 blur-3xl"
            />

            <ol className="relative grid divide-y divide-border/50 md:grid-cols-2 md:divide-x lg:grid-cols-4 lg:divide-y-0">
              {processSteps.steps.map((step, index) => {
                const isLast = index === processSteps.steps.length - 1;

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
        </div>
      </div>
      <SectionWave fillClassName={funnelWaveFills.white} variant="smooth" />
    </section>
  );
}
