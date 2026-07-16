"use client";

import { useRef } from "react";
import { BookingForm } from "@/components/home/booking-form";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { landingContainerClass } from "@/components/services/service-detail-ready-store-v2/shared";
import { useLandingScrollAnimations } from "@/components/services/service-detail-ready-store-v2/use-landing-scroll-animations";
import { cn } from "@/lib/utils";

export type ServiceBuyConsultationConfig = {
  promptTitle: string;
  promptCtaLabel: string;
  formTitle: string;
  description?: string;
  analyticsCtaId: string;
  sourcePage: string;
  analyticsPath: string;
  metaLead?: {
    contentName: string;
    leadSource?: string;
  };
  booking?: {
    showSocialProfileToggle?: boolean;
    notesLabel?: string;
    notesPlaceholder?: string;
    showOnSiteOption?: boolean;
  };
};

type ServiceBuyConsultationPromptProps = {
  consultation: ServiceBuyConsultationConfig;
};

export function ServiceBuyConsultationPrompt({ consultation }: ServiceBuyConsultationPromptProps) {
  return (
    <div
      data-animate-reveal
      className={cn(
        "mx-auto mt-10 max-w-3xl pb-2 text-center md:mt-12 md:pb-4",
        LANDING_REVEAL_CLASS,
      )}
    >
      <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        {consultation.promptTitle}
      </h2>
      <a
        href="#consultation"
        className="mt-4 inline-flex h-12 items-center justify-center rounded-full border border-border bg-card px-8 text-base font-semibold text-foreground shadow-sm transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100"
      >
        {consultation.promptCtaLabel}
      </a>
    </div>
  );
}

type ServiceBuyConsultationFormSectionProps = {
  consultation: ServiceBuyConsultationConfig;
  className?: string;
};

export function ServiceBuyConsultationFormSection({
  consultation,
  className,
}: ServiceBuyConsultationFormSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useLandingScrollAnimations(sectionRef, { staggerReveal: 0.1 });

  return (
    <div ref={sectionRef} className={cn(landingContainerClass, "pb-10 md:pb-16")}>
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
          sourcePage={consultation.sourcePage}
          pagePath={consultation.analyticsPath}
          analyticsPath={consultation.analyticsPath}
          analyticsCtaId={consultation.analyticsCtaId}
          metaLead={consultation.metaLead}
          showSocialProfileToggle={consultation.booking?.showSocialProfileToggle}
          notesLabel={consultation.booking?.notesLabel}
          notesPlaceholder={consultation.booking?.notesPlaceholder}
          showOnSiteOption={consultation.booking?.showOnSiteOption ?? false}
          className={cn("w-full max-w-none px-0 py-10 md:py-14", className)}
        />
      </div>
    </div>
  );
}
