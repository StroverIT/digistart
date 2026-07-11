"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { SiteLogo } from "@/components/layout/site-logo";
import GoogleReviewsSection from "@/components/services/service-detail-ready-store-v2/GoogleReviewsSection";
import { LANDING_BODY_CLASS, LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { GoogleDriveEmbed } from "@/components/videos/google-drive-embed";
import { YoutubeEmbed } from "@/components/videos/youtube-embed";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import { landingContainerClass } from "@/components/services/service-detail-ready-store-v2/shared";
import {
  funnelWaveFills,
  SectionWave,
} from "@/components/services/service-funnel/section-wave";
import type { ServiceFunnelPasConfig } from "@/config/service-funnels/types";
import { CaseStudy as RestyledCaseStudy } from "@/components/home/case-study";
import { FunnelWhoIsItForSection } from "@/components/services/service-funnel/funnel-who-is-it-for-section";
import { FunnelSalesStagePicker } from "@/components/services/service-funnel/funnel-sales-stage-picker";
import { useSalesStageSelection } from "@/components/services/funnel/use-sales-stage-selection";
import { resolveSalesStagePasSection } from "@/lib/funnel/sales-stage-pas";
import { FunnelScrollCtaLink } from "@/components/services/service-funnel/funnel-scroll-cta-link";
import { cn } from "@/lib/utils";

const funnelVideoFrameClass =
  "overflow-hidden rounded-2xl border border-primary/20 bg-card p-2 shadow-[var(--shadow-soft)] ring-1 ring-foreground/[0.03] sm:p-3";

const funnelVideoEmbedClass =
  "mx-auto rounded-xl border-0 bg-transparent shadow-none";

type FunnelHeroProps = {
  config: ServiceFunnelPasConfig;
};

function resolveCtaHref(config: ServiceFunnelPasConfig): string {
  if (config.checkout) {
    return "#checkout";
  }
  if (config.features?.consultationOnlyEnd) {
    return "#consultation";
  }
  return "#booking";
}

function renderHeroTitle(title: string, titleLead?: string) {
  if (!titleLead || !title.startsWith(titleLead)) {
    return title;
  }

  return (
    <>
      <span className="underline decoration-accent decoration-2 underline-offset-[0.2em]">
        {titleLead.toLocaleUpperCase("bg-BG")}
      </span>
      {title.slice(titleLead.length)}
    </>
  );
}

export function FunnelHero({ config }: FunnelHeroProps) {
  const { hero, whoIsItFor, features, serviceId, salesStagePicker } = config;
  const showHeroDescription = features?.showHeroDescription ?? false;
  const showHeroGoogleReviews = features?.showHeroGoogleReviews ?? true;
  const showProcessStepsSection = features?.showProcessStepsSection ?? false;
  const showResultsSection = features?.showResultsSection ?? false;
  const showResultsAfterProcess = features?.showResultsAfterProcess ?? false;
  const ctaHref = resolveCtaHref(config);
  const heroSectionRef = useRef<HTMLElement>(null);
  const { answer, hasAnswer } = useSalesStageSelection(
    salesStagePicker ? config.id : undefined,
  );

  const pasSection = useMemo(
    () =>
      salesStagePicker && answer
        ? resolveSalesStagePasSection(salesStagePicker, answer)
        : null,
    [answer, salesStagePicker],
  );

  useSectionScrollAnimations(heroSectionRef, { staggerReveal: 0.1 });

  const whoIsItForFooter: ReactNode =
    showResultsSection && !showResultsAfterProcess ? (
      <SectionWave fillClassName={funnelWaveFills.white} />
    ) : showProcessStepsSection && (!salesStagePicker || hasAnswer) ? (
      <SectionWave fillClassName={funnelWaveFills.foreground} variant="smooth" />
    ) : null;

  const showPasFlow = Boolean(salesStagePicker && hasAnswer);

  return (
    <>
      <section
        ref={heroSectionRef}
        className="relative scroll-mt-28 overflow-hidden border-b-0 bg-[var(--gradient-funnel-hero)] pt-0 pb-0"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 left-1/2 h-64 w-[min(100%,36rem)] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-16 top-1/3 h-48 w-48 rounded-full bg-accent/5 blur-3xl" />
        </div>
        <div className={cn(landingContainerClass, "relative z-10 pt-funnel-top pb-8 md:pb-10 lg:pb-12")}>
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 text-center sm:gap-6 md:gap-8">
            <div data-animate-reveal className={LANDING_REVEAL_CLASS}>
              <SiteLogo className="justify-center" size="lg" />
            </div>
            {hero.eyebrow ? (
              <p
                data-animate-reveal
                className={cn(
                  "text-sm font-semibold uppercase tracking-widest text-accent",
                  LANDING_REVEAL_CLASS,
                )}
              >
                {hero.eyebrow}
              </p>
            ) : null}
            <h1
              data-animate-reveal
              className={cn(
                "font-heading max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]",
                LANDING_REVEAL_CLASS,
              )}
            >
              {renderHeroTitle(hero.title, hero.titleLead)}
            </h1>
            {hero.subtitle ? (
              <p
                data-animate-reveal
                className={cn(
                  "font-heading max-w-2xl text-xl font-medium sm:text-2xl",
                  LANDING_BODY_CLASS,
                  LANDING_REVEAL_CLASS,
                )}
              >
                {hero.subtitle}
              </p>
            ) : null}
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
              <div className={cn(funnelVideoFrameClass, hero.video.format === "short" ? "mx-auto max-w-[min(100%,400px)]" : "max-w-5xl")}>
                {hero.video.provider === "google-drive" ? (
                  <GoogleDriveEmbed
                    fileId={hero.video.fileId}
                    title={hero.video.title}
                    thumbnailSrc={hero.video.thumbnailSrc}
                    className={cn(
                      funnelVideoEmbedClass,
                      hero.video.format === "short"
                        ? "aspect-[9/16] w-full"
                        : "aspect-video w-full",
                    )}
                  />
                ) : (
                  <YoutubeEmbed
                    youtubeId={hero.video.youtubeId}
                    title={hero.video.title}
                    className={cn(
                      funnelVideoEmbedClass,
                      hero.video.format === "short"
                        ? "aspect-[9/16] w-full"
                        : "aspect-video w-full",
                    )}
                  />
                )}
              </div>
            </div>
          ) : null}

          <div
            data-animate-reveal
            className={cn(
              "mx-auto mt-8 flex max-w-6xl justify-center sm:mt-10 md:mt-12",
              LANDING_REVEAL_CLASS,
            )}
          >
            <FunnelScrollCtaLink
              config={config}
              section="hero"
              href={ctaHref}
              className="group inline-flex h-14 w-full max-w-md items-center justify-center gap-2.5 rounded-full bg-accent px-10 text-lg font-semibold text-accent-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100 sm:w-auto md:h-16 md:px-12 md:text-xl"
            >
              {hero.ctaLabel}
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5 md:size-6" />
            </FunnelScrollCtaLink>
          </div>

          {showHeroGoogleReviews ? (
            <div
              data-animate-reveal
              className={cn("mt-12 md:mt-16 lg:mt-20", LANDING_REVEAL_CLASS)}
            >
              <GoogleReviewsSection />
            </div>
          ) : null}
        </div>
        <SectionWave fillClassName={funnelWaveFills.lavender} />
      </section>

      {salesStagePicker ? (
        <FunnelSalesStagePicker
          funnelId={config.id}
          picker={salesStagePicker}
          pagePath={config.pagePath}
        />
      ) : null}

      {showPasFlow && pasSection ? (
        <FunnelWhoIsItForSection
          whoIsItFor={pasSection}
          serviceId={serviceId}
          sectionId="pas"
          compactPasImages
          className="bg-[var(--funnel-lavender)] pt-6 pb-2 md:pt-8 md:pb-4"
        />
      ) : null}

      {salesStagePicker && !showPasFlow ? null : (
        <FunnelWhoIsItForSection
          whoIsItFor={whoIsItFor}
          serviceId={serviceId}
          footer={whoIsItForFooter}
          className={cn(
            "bg-[var(--funnel-lavender)]",
            showPasFlow && "pt-14 md:pt-20 lg:pt-24",
          )}
          footerSpacingClassName={showPasFlow ? "pb-14 md:pb-20 lg:pb-24" : undefined}
          gridClassName={showPasFlow ? "mt-6 md:mt-8" : undefined}
        />
      )}

      {showResultsSection && !showResultsAfterProcess ? (
        <div className="-mt-10 bg-white sm:-mt-12 md:-mt-16">
          <RestyledCaseStudy className="pt-12 pb-20 md:pt-16 md:pb-28" />
          {showProcessStepsSection ? (
            <SectionWave fillClassName={funnelWaveFills.process} />
          ) : null}
        </div>
      ) : null}
    </>
  );
}
