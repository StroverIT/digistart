"use client";

import { Suspense, useRef } from "react";
import { FreeAnalysisForm } from "@/components/google/free-analysis-form";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { gbLabelClass } from "@/components/services/service-detail-google-business-v2/shared";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import {
  GOOGLE_ANALYSIS_3_TIPS_FORM_ID,
  GOOGLE_ANALYSIS_3_TIPS_SOURCE,
  googleFreeAnalysisContent,
} from "@/lib/data/google-free-analysis-content";
import { cn } from "@/lib/utils";

export function Analysis3TipsFormSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const copy = googleFreeAnalysisContent.analysis3TipsPage.form;

  useSectionScrollAnimations(sectionRef, {
    staggerReveal: 0.12,
    start: "top 85%",
  });

  return (
    <section
      ref={sectionRef}
      id={GOOGLE_ANALYSIS_3_TIPS_FORM_ID}
      className="scroll-mt-28 pt-12 pb-0 md:pt-16"
    >
      <div
        data-animate-reveal
        className={cn(
          "@container mx-auto w-full max-w-3xl rounded-3xl border border-border/70 bg-white/95 p-6 shadow-xl shadow-primary/10 md:p-10",
          LANDING_REVEAL_CLASS,
        )}
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span
            className={cn(
              `${gbLabelClass} mb-0 w-fit border-0 !bg-white px-4 py-2 text-sm shadow-sm`,
            )}
          >
            {copy.badge}
          </span>
          <h2 className="font-heading text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {copy.titleBefore}
            <span className="font-accent italic font-semibold text-foreground">
              {copy.titleAccent}
            </span>
          </h2>
          <div className="mt-2 h-px w-full max-w-md bg-border" />
        </div>

        <Suspense fallback={<div className="h-96 rounded-xl border border-border bg-card" />}>
          <FreeAnalysisForm
            source={GOOGLE_ANALYSIS_3_TIPS_SOURCE}
            apiPath="/api/google/analysis-3-tips"
            metaContentName="DigiStart - Анализ 3 съвета"
            analyticsCtaId="google_analysis_3_tips_submit"
            submitLabel={copy.submit}
            consentText={copy.consent}
          />
        </Suspense>
      </div>
    </section>
  );
}
