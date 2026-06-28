"use client";

import { ArrowRight } from "lucide-react";
import GoogleReviewsSection from "@/components/services/service-detail-ready-store-v2/GoogleReviewsSection";
import { LandingSection } from "@/components/services/service-detail-ready-store-v2/shared";
import { SectionWave } from "@/components/services/social-media-funnel/section-wave";
import { SOCIAL_MEDIA_FUNNEL } from "@/config/service-landing/social-media-funnel";

const { hero } = SOCIAL_MEDIA_FUNNEL;

export function FunnelHero() {
  return (
    <>
      <LandingSection
        className="border-b-0 bg-linear-to-b from-white to-primary/50 pt-0 pb-8 md:pb-10 lg:pb-12"
        contentClassName="pt-site-header"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 text-center sm:gap-6 md:gap-8">
          <h1 className="font-heading max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            {hero.title}
          </h1>
          <p className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
            {hero.subtitle}
          </p>

          <a
            href="#booking"
            className="group inline-flex h-12 w-full max-w-sm items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100 sm:w-auto"
          >
            {hero.ctaLabel}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        <div className="mt-12 md:mt-16 lg:mt-20">
          <GoogleReviewsSection />
        </div>
      </LandingSection>
      <SectionWave fillClassName="text-[#F8F7FF]" className="-mt-10" />
    </>
  );
}
