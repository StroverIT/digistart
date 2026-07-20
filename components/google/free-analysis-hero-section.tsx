"use client";

import { Suspense, useRef } from "react";
import { FreeAnalysisForm } from "@/components/google/free-analysis-form";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { gbLabelClass } from "@/components/services/service-detail-google-business-v2/shared";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import { googleFreeAnalysisContent } from "@/lib/data/google-free-analysis-content";
import { cn } from "@/lib/utils";

export function FreeAnalysisHeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useSectionScrollAnimations(sectionRef, {
    staggerReveal: 0.12,
    animateOnMount: true,
  });

  return (
    <section
      ref={sectionRef}
      className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-8 md:flex-row md:items-start md:gap-10 lg:gap-14"
    >
      <div className="flex w-full flex-col gap-4 text-center md:w-1/2 md:gap-6 md:text-left">
        <span
          data-animate-reveal
          className={cn(
            `${gbLabelClass} mx-auto mb-0 w-fit border-0 !bg-white px-4 py-2 text-sm shadow-sm md:mx-0`,
            LANDING_REVEAL_CLASS,
          )}
        >
          {googleFreeAnalysisContent.formPage.badge}
        </span>
        <h1
          data-animate-reveal
          className={cn(
            "font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl lg:leading-[1.05]",
            LANDING_REVEAL_CLASS,
          )}
        >
          {googleFreeAnalysisContent.formPage.title}
        </h1>
        <p
          data-animate-reveal
          className={cn(
            "text-lg leading-relaxed text-muted-foreground sm:text-xl md:text-xl lg:text-2xl",
            LANDING_REVEAL_CLASS,
          )}
        >
          {googleFreeAnalysisContent.formPage.description}
        </p>
        <p
          data-animate-reveal
          className={cn(
            "text-lg font-medium text-foreground sm:text-xl md:text-xl lg:text-2xl",
            LANDING_REVEAL_CLASS,
          )}
        >
          {googleFreeAnalysisContent.formPage.disclaimer}
        </p>
      </div>

      <div
        data-animate-reveal
        className={cn(
          "@container w-full rounded-3xl border border-border/70 bg-white/95 p-6 shadow-xl shadow-primary/10 md:w-1/2 md:p-10",
          LANDING_REVEAL_CLASS,
        )}
      >
        <Suspense fallback={<div className="h-96 rounded-xl border border-border bg-card" />}>
          <FreeAnalysisForm />
        </Suspense>
      </div>
    </section>
  );
}
