"use client";

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { TemplateCard } from "@/components/templates/template-card";
import {
  ServiceSectionBuyCta,
  type ServiceSectionBuyCtaConfig,
} from "@/components/services/service-section-buy-cta";
import { getLatestTemplates } from "@/lib/data/templates";
import { cn } from "@/lib/utils";

type TemplatesShowcaseSectionProps = {
  headingFontClass?: string;
  className?: string;
  buyCta?: ServiceSectionBuyCtaConfig;
};

export function TemplatesShowcaseSection({
  headingFontClass,
  className,
  buyCta,
}: TemplatesShowcaseSectionProps) {
  const latestTemplates = getLatestTemplates(3);

  if (latestTemplates.length === 0) return null;

  return (
    <section data-animate-section className={cn("py-8 md:py-20 bg-background", className)}>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
          <span
            data-animate-reveal
            className="text-primary font-semibold text-sm uppercase tracking-wider mb-3 block opacity-0 translate-y-10"
          >
            Готови дизайни
          </span>
          <h2
            data-animate-reveal
            className={cn(
              headingFontClass,
              "text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance opacity-0 translate-y-10",
            )}
          >
            Разгледай <span className="gradient-text">шаблоните</span>
          </h2>
          <p
            data-animate-reveal
            className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
          >
            Виж как изглежда магазинът ти още преди да поръчаш — избери шаблон, който пасва на
            твоя бранд.
          </p>
        </div>

        <div
          data-animate-card
          className={cn(
            "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8 opacity-0 translate-y-10",
            latestTemplates.length === 1 && "lg:grid-cols-1 max-w-md mx-auto",
            latestTemplates.length === 2 && "lg:grid-cols-2 max-w-4xl mx-auto",
          )}
        >
          {latestTemplates.map((template) => (
            <TemplateCard key={`${template.category}-${template.id}`} template={template} />
          ))}
        </div>

        <div data-animate-reveal className="flex justify-center opacity-0 translate-y-10">
          <TrackedCtaLink href="/templates" ctaId="service_ready_store_browse_templates">
            <Button variant="outline" size="lg" type="button" className="gap-2">
              Всички шаблони
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </TrackedCtaLink>
        </div>
        {buyCta ? (
          <div
            data-animate-reveal
            className="mt-4 flex justify-center opacity-0 translate-y-10"
          >
            <ServiceSectionBuyCta {...buyCta} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
