"use client";

import ConsultationBookingForm from "@/components/consultation/consultation-booking-form";
import { ProcessStepsContent } from "@/components/home/process-steps";
import { SOCIAL_MEDIA_FUNNEL } from "@/config/service-landing/social-media-funnel";

const { hero, pagePath, sourcePage, analyticsCtaId, metaLead, processSteps } = SOCIAL_MEDIA_FUNNEL;

export function FunnelBookingCard() {
  return (
    <section id="booking" className="bg-white pt-10 pb-16 md:pt-12 md:pb-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-[var(--shadow-soft)]">
          <div className="grid gap-0 lg:grid-cols-[1fr_1.1fr]">
            <div className="border-b border-primary/10 bg-primary/5 p-6 md:p-8 lg:border-b-0 lg:border-r">
              <div>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  {hero.ctaLabel}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                  Попълни формата и нека обсъдим в кратък разговор как може да помогнем
                </p>
              </div>

              <div className="mt-8 border-t border-primary/10 pt-8">
                <ProcessStepsContent
                  variant="embedded"
                  title={processSteps.title}
                  subtitle={processSteps.subtitle}
                  steps={[...processSteps.steps]}
                />
              </div>
            </div>

            <div className="p-6 md:p-8">
              <ConsultationBookingForm
                source="public"
                sourcePage={sourcePage}
                variant="embedded"
                showCompanyField={false}
                showSocialProfileToggle
                notesLabel="Линк към Instagram/Facebook профила"
                notesPlaceholder="https://instagram.com/твоят_профил"
                showOnSiteOption
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
