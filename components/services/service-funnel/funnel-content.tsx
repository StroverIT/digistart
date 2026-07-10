"use client";

import { useRef } from "react";
import { Check } from "lucide-react";
import dynamic from "next/dynamic";
import { FunnelBookingCard } from "@/components/services/service-funnel/funnel-booking-card";
import { FunnelCheckoutSection } from "@/components/services/service-funnel/funnel-checkout-section";
import { FunnelConsultationSection } from "@/components/services/service-funnel/funnel-consultation-section";
import { FunnelProcessStepsSection } from "@/components/services/service-funnel/funnel-process-steps-section";
import { useSalesStageSelection } from "@/components/services/funnel/use-sales-stage-selection";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import {
  funnelWaveFills,
  SectionWave,
} from "@/components/services/service-funnel/section-wave";
import type { ServiceFunnelPasConfig } from "@/config/service-funnels/types";
import { CaseStudy as RestyledCaseStudy } from "@/components/home/case-study";
import { cn } from "@/lib/utils";

const CaseStudy = dynamic(
  () => import("@/components/services/service-detail-social-media-v2/CaseStudy"),
);

const PasFaqSection = dynamic(() =>
  import("@/components/services/service-pas-landing/faq-section").then((mod) => ({
    default: mod.PasFaqSection,
  })),
);

type FunnelContentSectionsProps = {
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

function DoneForYouSection({
  doneForYou,
  heroCtaLabel,
  ctaHref,
  waveFillClassName,
  continuesFromWhoIsItFor = false,
}: {
  doneForYou: NonNullable<ServiceFunnelPasConfig["doneForYou"]>;
  heroCtaLabel: string;
  ctaHref: string;
  waveFillClassName: string;
  continuesFromWhoIsItFor?: boolean;
}) {
  const doneForYouRef = useRef<HTMLElement>(null);

  useSectionScrollAnimations(doneForYouRef, { staggerReveal: 0.08 });

  return (
    <section
      ref={doneForYouRef}
      className={cn(
        "bg-[var(--funnel-lavender)] pb-8 md:pb-10",
        continuesFromWhoIsItFor && "pt-8 md:pt-10",
      )}
    >
      <div className="container mx-auto px-4 md:px-8 pb-16">
        <div className="mx-auto max-w-3xl">
          <h2
            data-animate-reveal
            className={cn(
              "font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl",
              LANDING_REVEAL_CLASS,
            )}
          >
            {doneForYou.title}
          </h2>
          <ul className="mt-8 space-y-4 md:mt-10">
            {doneForYou.items.map((item) => (
              <li
                key={item}
                data-animate-reveal
                className={cn("flex gap-3 text-sm md:text-base", LANDING_REVEAL_CLASS)}
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#A8E6CF] text-[#2D5C4A]">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <span className="text-foreground/85">{item}</span>
              </li>
            ))}
          </ul>
          <p
            data-animate-reveal
            className={cn(
              "mt-6 text-base leading-relaxed text-muted-foreground md:mt-8 md:text-lg",
              LANDING_REVEAL_CLASS,
            )}
          >
            {doneForYou.description}
          </p>

          <a
            data-animate-reveal
            href={ctaHref}
            className={cn(
              "mt-10 inline-flex h-12 items-center justify-center rounded-full bg-[#A8E6CF] px-8 text-base font-bold text-foreground shadow-md transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100 md:mt-12",
              LANDING_REVEAL_CLASS,
            )}
          >
            {heroCtaLabel}
          </a>
        </div>
      </div>
      <SectionWave fillClassName={waveFillClassName} />
    </section>
  );
}

export function FunnelContentSections({ config }: FunnelContentSectionsProps) {
  const { faq, features, checkout, salesStagePicker } = config;
  const showCaseStudy = features?.showCaseStudy ?? true;
  const showResultsSection = features?.showResultsSection ?? false;
  const showResultsAfterProcess = features?.showResultsAfterProcess ?? false;
  const showProcessStepsSection = features?.showProcessStepsSection ?? false;
  const consultationOnlyEnd = features?.consultationOnlyEnd ?? false;
  const hideDoneForYouSection = features?.hideDoneForYouSection ?? false;
  const { hasAnswer } = useSalesStageSelection(salesStagePicker ? config.id : undefined);
  const showPostPickerContent = !salesStagePicker || hasAnswer;
  const ctaHref = resolveCtaHref(config);

  const doneForYouWaveFill =
    consultationOnlyEnd && showProcessStepsSection
      ? funnelWaveFills.process
      : showCaseStudy
        ? funnelWaveFills.process
        : funnelWaveFills.white;

  const processSection =
    showProcessStepsSection && showPostPickerContent ? (
      <FunnelProcessStepsSection config={config} ctaHref={consultationOnlyEnd ? ctaHref : undefined} />
    ) : null;

  const doneForYouSection =
    !checkout && !hideDoneForYouSection && config.doneForYou ? (
      <DoneForYouSection
        doneForYou={config.doneForYou}
        heroCtaLabel={config.hero.ctaLabel}
        ctaHref={ctaHref}
        waveFillClassName={doneForYouWaveFill}
        continuesFromWhoIsItFor={consultationOnlyEnd}
      />
    ) : null;

  return (
    <>
      {consultationOnlyEnd ? (
        <>
          {doneForYouSection}
          {processSection}
        </>
      ) : (
        <>
          {processSection}
          {doneForYouSection}
        </>
      )}

      {showResultsSection && showResultsAfterProcess && showPostPickerContent ? (
        <div className="-mt-10 bg-white sm:-mt-12 md:-mt-16">
          <RestyledCaseStudy className="pt-12 pb-20 md:pt-16 md:pb-28" />
          <SectionWave fillClassName={funnelWaveFills.faq} variant="smooth" />
        </div>
      ) : null}

      {showCaseStudy && showPostPickerContent ? <CaseStudy compact /> : null}

      {showCaseStudy && showPostPickerContent ? (
        <SectionWave fillClassName={funnelWaveFills.white} />
      ) : null}

      {checkout ? (
        <FunnelCheckoutSection config={config} />
      ) : consultationOnlyEnd ? null : (
        <FunnelBookingCard config={config} />
      )}

      {showPostPickerContent ? <PasFaqSection {...faq} /> : null}

      {checkout && config.consultation ? (
        <SectionWave fillClassName={funnelWaveFills.background} />
      ) : consultationOnlyEnd && config.consultation && showPostPickerContent ? (
        <SectionWave fillClassName={funnelWaveFills.background} variant="smooth" />
      ) : null}

      {config.consultation && showPostPickerContent ? (
        <FunnelConsultationSection config={config} />
      ) : null}
    </>
  );
}
