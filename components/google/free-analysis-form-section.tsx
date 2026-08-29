"use client";

import { Suspense, useRef } from "react";
import { FreeAnalysisForm } from "@/components/google/free-analysis-form";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import {
  GOOGLE_FREE_ANALYSIS_FORM_ID,
  googleFreeAnalysisContent,
} from "@/lib/data/google-free-analysis-content";
import { cn } from "@/lib/utils";

export function FreeAnalysisFormSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useSectionScrollAnimations(sectionRef, {
    staggerReveal: 0.12,
    start: "top 85%",
  });

  return (
    <section
      ref={sectionRef}
      id={GOOGLE_FREE_ANALYSIS_FORM_ID}
      className="scroll-mt-28 pt-12 pb-0 md:pt-16"
    >
      <div
        data-animate-reveal
        className={cn(
          "@container mx-auto w-full max-w-3xl rounded-3xl border border-border/70 bg-white/95 p-6 shadow-xl shadow-primary/10 md:p-10",
          LANDING_REVEAL_CLASS,
        )}
      >
        <Suspense fallback={<div className="h-96 rounded-xl border border-border bg-card" />}>
          <FreeAnalysisForm
            submitLabel={googleFreeAnalysisContent.formPage.submit}
            consentText={googleFreeAnalysisContent.formPage.consent}
          />
        </Suspense>
      </div>
    </section>
  );
}
