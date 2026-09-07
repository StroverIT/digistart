"use client";

import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import HeroVideo from "@/components/services/service-detail-ready-store-v2/HeroVideo";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { gbLabelClass } from "@/components/services/service-detail-google-business-v2/shared";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import {
  GOOGLE_FREE_ANALYSIS_FORM_ID,
  googleFreeAnalysisContent,
} from "@/lib/data/google-free-analysis-content";
import { cn } from "@/lib/utils";

export function FreeAnalysisHeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const copy = googleFreeAnalysisContent.formPage;

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
        <span
          data-animate-reveal
          className={cn(
            `${gbLabelClass} mb-0 w-fit border-0 !bg-white px-4 py-2 text-sm shadow-sm`,
            LANDING_REVEAL_CLASS,
          )}
        >
          {copy.badge}
        </span>
        <h1
          data-animate-reveal
          className={cn(
            "font-heading text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl",
            LANDING_REVEAL_CLASS,
          )}
        >
          {copy.title}
        </h1>
        <p
          data-animate-reveal
          className={cn(
            "text-base leading-relaxed text-foreground/80 sm:text-lg md:text-xl",
            LANDING_REVEAL_CLASS,
          )}
        >
          {copy.description}
        </p>
        <p
          data-animate-reveal
          className={cn(
            "text-base font-medium leading-relaxed text-foreground sm:text-lg md:text-xl",
            LANDING_REVEAL_CLASS,
          )}
        >
          {copy.disclaimer}
        </p>
        <div data-animate-reveal className={cn(LANDING_REVEAL_CLASS)}>
          <a
            href={`#${GOOGLE_FREE_ANALYSIS_FORM_ID}`}
            className="inline-flex h-14 w-full max-w-md items-center justify-center gap-2 rounded-full bg-accent px-8 text-base font-semibold uppercase tracking-wide text-accent-foreground transition hover:opacity-90"
          >
            Попълни формата
            <ArrowDown className="h-5 w-5" />
          </a>
        </div>
      </div>

      <div data-animate-reveal className={cn("w-full max-w-3xl", LANDING_REVEAL_CLASS)}>
        <HeroVideo
          videoId="Dl_lcHcaMng"
          title="Безплатен Google анализ"
          thumbnailSrc="/video-thumbnail.png"
          muteOnPlay
        />
      </div>
    </section>
  );
}
