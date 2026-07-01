"use client";

import { BookingForm } from "@/components/home/booking-form";
import type { ServiceFunnelConfig } from "@/config/service-funnels/types";
import { cn } from "@/lib/utils";

type FunnelConsultationSectionProps = {
  config: ServiceFunnelConfig;
  className?: string;
};

export function FunnelConsultationSection({ config, className }: FunnelConsultationSectionProps) {
  const { consultation, pagePath, sourcePage, metaLead } = config;

  if (!consultation) {
    return null;
  }

  return (
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
  );
}
