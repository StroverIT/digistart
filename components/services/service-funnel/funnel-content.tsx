import { Check } from "lucide-react";
import dynamic from "next/dynamic";
import { FunnelBookingCard } from "@/components/services/service-funnel/funnel-booking-card";
import { FunnelCheckoutSection } from "@/components/services/service-funnel/funnel-checkout-section";
import { FunnelConsultationSection } from "@/components/services/service-funnel/funnel-consultation-section";
import { FunnelProcessStepsSection } from "@/components/services/service-funnel/funnel-process-steps-section";
import {
  funnelWaveFills,
  SectionWave,
} from "@/components/services/service-funnel/section-wave";
import type { ServiceFunnelConfig } from "@/config/service-funnels/types";

const CaseStudy = dynamic(
  () => import("@/components/services/service-detail-social-media-v2/CaseStudy"),
);

const PasFaqSection = dynamic(() =>
  import("@/components/services/service-pas-landing/faq-section").then((mod) => ({
    default: mod.PasFaqSection,
  })),
);

type FunnelContentSectionsProps = {
  config: ServiceFunnelConfig;
};

export function FunnelContentSections({ config }: FunnelContentSectionsProps) {
  const { doneForYou, faq, hero, features, checkout } = config;
  const showCaseStudy = features?.showCaseStudy ?? true;
  const showProcessStepsSection = features?.showProcessStepsSection ?? false;
  const ctaHref = checkout ? "#checkout" : "#booking";

  return (
    <>
      {showProcessStepsSection ? <FunnelProcessStepsSection config={config} /> : null}

      {!checkout ? (
        <section className="bg-[#F8F7FF] pb-8 md:pb-10">
          <div className="container mx-auto px-4 md:px-8 pb-16">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {doneForYou.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                {doneForYou.description}
              </p>
              <ul className="mt-8 space-y-3">
                {doneForYou.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm md:text-base">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#A8E6CF] text-[#2D5C4A]">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    <span className="text-foreground/85">{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href={ctaHref}
                className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#A8E6CF] px-8 text-base font-bold text-foreground shadow-md transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100"
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
