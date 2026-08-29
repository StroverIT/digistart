"use client";

import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import HeroVideo from "@/components/services/service-detail-ready-store-v2/HeroVideo";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import { googleFreeAnalysisContent } from "@/lib/data/google-free-analysis-content";
import { GOOGLE_ANALYSIS_3_TIPS_FORM_ID } from "@/lib/data/google-free-analysis-content";
import { cn } from "@/lib/utils";

export function Analysis3TipsHeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const copy = googleFreeAnalysisContent.analysis3TipsPage.hero;

  useSectionScrollAnimations(sectionRef, {
    staggerReveal: 0.12,
    animateOnMount: true,
  });

  return (
    <section
      ref={sectionRef}
      className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-8 text-center md:gap-10"
    >
      <div className="flex w-full max-w-3xl flex-col items-center gap-4 md:gap-6">
        <h1
          data-animate-reveal
          className={cn(
            "font-heading text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl md:text-3xl lg:text-4xl",
            LANDING_REVEAL_CLASS,
          )}
        >
          {copy.title}
        </h1>
        <p
          data-animate-reveal
          className={cn(
            "text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl",
            LANDING_REVEAL_CLASS,
          )}
        >
          {copy.description}
        </p>
        <div data-animate-reveal className={cn(LANDING_REVEAL_CLASS)}>
          <a
            href={`#${GOOGLE_ANALYSIS_3_TIPS_FORM_ID}`}
            className="inline-flex h-14 w-full max-w-md items-center justify-center gap-2 rounded-full bg-accent px-8 text-base font-semibold uppercase tracking-wide text-accent-foreground transition hover:opacity-90"
          >
            {copy.cta}
            <ArrowDown className="h-5 w-5" />
          </a>
        </div>
      </div>

      <div data-animate-reveal className={cn("w-full max-w-3xl", LANDING_REVEAL_CLASS)}>
        <HeroVideo
          videoId="_yCuk-GYlzo"
          title="Безплатен анализ: 3 неща за по-високо класиране в Google"
          thumbnailSrc="/video-thumbnail.png"
          muteOnPlay
        />
      </div>
    </section>
  );
}
