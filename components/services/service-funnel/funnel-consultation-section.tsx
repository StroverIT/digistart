"use client";

import { useRef } from "react";
import { BookingForm } from "@/components/home/booking-form";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import type { ServiceFunnelPasConfig } from "@/config/service-funnels/types";
import { cn } from "@/lib/utils";

type FunnelConsultationSectionProps = {
  config: ServiceFunnelPasConfig;
  className?: string;
};

export function FunnelConsultationSection({ config, className }: FunnelConsultationSectionProps) {
  const { consultation, pagePath, sourcePage, metaLead } = config;
  const sectionRef = useRef<HTMLDivElement>(null);

  useSectionScrollAnimations(sectionRef, { staggerReveal: 0.1 });

  if (!consultation) {
    return null;
  }

  return (
    <div ref={sectionRef}>
      <div data-animate-reveal className={LANDING_REVEAL_CLASS}>
        <BookingForm
          sectionId="consultation"
          showBadge={false}
          title={consultation.formTitle}
          description={
            consultation.description ??
            "Нека обсъдим всичко което те притеснява за да имаш плавен старт"
          }
          showProcessSteps={false}
          sourcePage={sourcePage}
          analyticsPath={pagePath}
          analyticsCtaId={consultation.analyticsCtaId}
          metaLead={consultation.metaLead ?? metaLead}
          showSocialProfileToggle={consultation.booking?.showSocialProfileToggle}
          notesLabel={consultation.booking?.notesLabel}
          notesPlaceholder={consultation.booking?.notesPlaceholder}
          showOnSiteOption={consultation.booking?.showOnSiteOption ?? true}
          className={cn("pt-0 md:pt-0", className)}
        />
      </div>
    </div>
  );
}
