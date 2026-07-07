"use client";

import { useRef } from "react";
import { Check } from "lucide-react";
import dynamic from "next/dynamic";
import { FunnelBookingCard } from "@/components/services/service-funnel/funnel-booking-card";
import { FunnelCheckoutSection } from "@/components/services/service-funnel/funnel-checkout-section";
import { FunnelConsultationSection } from "@/components/services/service-funnel/funnel-consultation-section";
import { FunnelProcessStepsSection } from "@/components/services/service-funnel/funnel-process-steps-section";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import {
  funnelWaveFills,
  SectionWave,
} from "@/components/services/service-funnel/section-wave";
import type { ServiceFunnelPasConfig } from "@/config/service-funnels/types";
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

export function FunnelContentSections({ config }: FunnelContentSectionsProps) {
  const { doneForYou, faq, hero, features, checkout } = config;
  const showCaseStudy = features?.showCaseStudy ?? true;
  const showProcessStepsSection = features?.showProcessStepsSection ?? false;
  const ctaHref = checkout ? "#checkout" : "#booking";
  const doneForYouRef = useRef<HTMLElement>(null);

  useSectionScrollAnimations(doneForYouRef, { staggerReveal: 0.08 });

  return (
    <>
      {showProcessStepsSection ? <FunnelProcessStepsSection config={config} /> : null}

      {!checkout ? (
        <section ref={doneForYouRef} className="bg-[#F8F7FF] pb-8 md:pb-10">
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
              <p
                data-animate-reveal
                className={cn(
                  "mt-4 text-base leading-relaxed text-muted-foreground md:text-lg",
                  LANDING_REVEAL_CLASS,
                )}
              >
                {doneForYou.description}
              </p>
              <ul className="mt-8 space-y-3">
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

              <a
                data-animate-reveal
                href={ctaHref}
                className={cn(
                  "mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#A8E6CF] px-8 text-base font-bold text-foreground shadow-md transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100",
                  LANDING_REVEAL_CLASS,
                )}
              >
                {hero.ctaLabel}
              </a>
            </div>
          </div>
          <SectionWave
            fillClassName={
              showCaseStudy ? funnelWaveFills.process : funnelWaveFills.white
            }
          />
        </section>
      ) : null}

      {showCaseStudy ? <CaseStudy compact /> : null}

      {showCaseStudy ? <SectionWave fillClassName={funnelWaveFills.white} /> : null}

      {checkout ? <FunnelCheckoutSection config={config} /> : <FunnelBookingCard config={config} />}

      <PasFaqSection {...faq} />

      {checkout && config.consultation ? (
        <SectionWave fillClassName={funnelWaveFills.background} />
      ) : null}

      {config.consultation ? <FunnelConsultationSection config={config} /> : null}
    </>
  );
}
