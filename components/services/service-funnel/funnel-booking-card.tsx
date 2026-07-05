"use client";

import { useRef } from "react";
import ConsultationBookingForm from "@/components/consultation/consultation-booking-form";
import { ProcessStepsContent } from "@/components/home/process-steps";
import { LANDING_CARD_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import type { ServiceFunnelConfig } from "@/config/service-funnels/types";
import { cn } from "@/lib/utils";

type FunnelBookingCardProps = {
  config: ServiceFunnelConfig;
};

export function FunnelBookingCard({ config }: FunnelBookingCardProps) {
  const { hero, pagePath, sourcePage, analyticsCtaId, metaLead, processSteps, booking, features } =
    config;
  const showProcessStepsInBooking = features?.showProcessStepsInBooking ?? true;
  const sectionRef = useRef<HTMLElement>(null);

  useSectionScrollAnimations(sectionRef, { staggerCard: 0.15 });

  return (
    <section ref={sectionRef} id="booking" className="bg-white pt-10 pb-16 md:pt-12 md:pb-20">
      <div className="container mx-auto px-4 md:px-8">
        <div
          data-animate-card
          className={cn(
            "mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-[var(--shadow-soft)]",
            LANDING_CARD_CLASS,
          )}
        >
          <div
            className={
              showProcessStepsInBooking
                ? "grid gap-0 lg:grid-cols-[1fr_1.1fr]"
                : "grid gap-0"
            }
          >
            <div
              className={
                showProcessStepsInBooking
                  ? "border-b border-primary/10 bg-primary/5 p-6 md:p-8 lg:border-b-0 lg:border-r"
                  : "border-b border-primary/10 bg-primary/5 p-6 md:p-8"
              }
            >
              <div>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  {hero.ctaLabel}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                  Попълни формата и нека обсъдим в кратък разговор как може да помогнем
                </p>
              </div>

              {showProcessStepsInBooking ? (
                <div className="mt-8 border-t border-primary/10 pt-8">
                  <ProcessStepsContent
                    variant="embedded"
                    title={processSteps.title}
                    subtitle={processSteps.subtitle}
                    steps={[...processSteps.steps]}
                  />
                </div>
              ) : null}
            </div>

            <div className={showProcessStepsInBooking ? "p-6 md:p-8" : "p-6 md:p-8 lg:px-10"}>
              <ConsultationBookingForm
                source="public"
                sourcePage={sourcePage}
                variant="embedded"
                showCompanyField={false}
                showSocialProfileToggle={booking?.showSocialProfileToggle}
                notesLabel={booking?.notesLabel}
                notesPlaceholder={booking?.notesPlaceholder}
                showOnSiteOption={booking?.showOnSiteOption}
                submitLabel="Потвърди консултацията"
                analyticsPath={pagePath}
                analyticsCtaId={analyticsCtaId}
                metaLead={metaLead}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
