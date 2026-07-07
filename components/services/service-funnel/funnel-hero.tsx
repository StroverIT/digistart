"use client";

import { useRef, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { SiteLogo } from "@/components/layout/site-logo";
import GoogleReviewsSection from "@/components/services/service-detail-ready-store-v2/GoogleReviewsSection";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { GoogleDriveEmbed } from "@/components/videos/google-drive-embed";
import { YoutubeEmbed } from "@/components/videos/youtube-embed";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import { landingContainerClass } from "@/components/services/service-detail-ready-store-v2/shared";
import {
  funnelWaveFills,
  SectionWave,
} from "@/components/services/service-funnel/section-wave";
import type { ServiceFunnelPasConfig } from "@/config/service-funnels/types";
import { FunnelWhoIsItForSection } from "@/components/services/service-funnel/funnel-who-is-it-for-section";
import { cn } from "@/lib/utils";

type FunnelHeroProps = {
  config: ServiceFunnelPasConfig;
};

export function FunnelHero({ config }: FunnelHeroProps) {
  const { hero, whoIsItFor, features, checkout, serviceId } = config;
  const showHeroDescription = features?.showHeroDescription ?? false;
  const showProcessStepsSection = features?.showProcessStepsSection ?? false;
  const ctaHref = checkout ? "#checkout" : "#booking";
  const heroSectionRef = useRef<HTMLElement>(null);

  useSectionScrollAnimations(heroSectionRef, { staggerReveal: 0.1 });

  const whoIsItForFooter: ReactNode = showProcessStepsSection ? (
    <SectionWave fillClassName={funnelWaveFills.process} />
  ) : null;

  return (
    <>
      <section
        ref={heroSectionRef}
        className="scroll-mt-28 overflow-visible border-b-0 bg-linear-to-b from-white to-primary/50 pt-0 pb-0"
      >
        <div className={cn(landingContainerClass, "pt-funnel-top pb-8 md:pb-10 lg:pb-12")}>
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 text-center sm:gap-6 md:gap-8">
            <div data-animate-reveal className={LANDING_REVEAL_CLASS}>
              <SiteLogo className="justify-center" />
            </div>
            <h1
              data-animate-reveal
              className={cn(
                "font-heading max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]",
                LANDING_REVEAL_CLASS,
              )}
            >
              {hero.title}
            </h1>
            <p
              data-animate-reveal
              className={cn(
                "font-heading max-w-2xl text-xl font-semibold text-foreground sm:text-2xl",
                LANDING_REVEAL_CLASS,
              )}
            >
              {hero.subtitle}
            </p>
            {showHeroDescription && hero.description ? (
              <p
                data-animate-reveal
                className={cn(
                  "max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg",
                  LANDING_REVEAL_CLASS,
                )}
              >
                {hero.description}
              </p>
            ) : null}
          </div>

          {hero.video ? (
            <div
              data-animate-reveal
              className={cn("mx-auto mt-8 w-full sm:mt-10 md:mt-12", LANDING_REVEAL_CLASS)}
            >
              {hero.video.provider === "google-drive" ? (
                <GoogleDriveEmbed
                  fileId={hero.video.fileId}
                  title={hero.video.title}
                  thumbnailSrc={hero.video.thumbnailSrc}
                  className={cn(
                    "mx-auto shadow-lg",
                    hero.video.format === "short"
                      ? "aspect-[9/16] w-full max-w-[min(100%,360px)] sm:max-w-[min(100%,400px)]"
                      : "max-w-2xl",
                  )}
                />
              ) : (
                <YoutubeEmbed
                  youtubeId={hero.video.youtubeId}
                  title={hero.video.title}
                  className={cn(
                    "mx-auto shadow-lg",
                    hero.video.format === "short"
                      ? "aspect-[9/16] w-full max-w-[min(100%,360px)] sm:max-w-[min(100%,400px)]"
                      : "max-w-2xl",
                  )}
                />
              )}
            </div>
          ) : null}

          <div
            data-animate-reveal
            className={cn(
              "mx-auto mt-8 flex max-w-6xl justify-center sm:mt-10 md:mt-12",
              LANDING_REVEAL_CLASS,
            )}
          >
            <a
              href={ctaHref}
              className="group inline-flex h-14 w-full max-w-md items-center justify-center gap-2.5 rounded-full bg-accent px-10 text-lg font-semibold text-accent-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100 sm:w-auto md:h-16 md:px-12 md:text-xl"
            >
              {hero.ctaLabel}
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5 md:size-6" />
            </a>
          </div>

          <div
            data-animate-reveal
            className={cn("mt-12 md:mt-16 lg:mt-20", LANDING_REVEAL_CLASS)}
          >
            <GoogleReviewsSection />
          </div>
        </div>
        <SectionWave fillClassName={funnelWaveFills.lavender} />
      </section>

      <FunnelWhoIsItForSection
        whoIsItFor={whoIsItFor}
        serviceId={serviceId}
        footer={whoIsItForFooter}
      />
    </>
  );
}
