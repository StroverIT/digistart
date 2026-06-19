"use client";

import { useRef } from "react";
import { TemplateCard } from "@/components/templates/template-card";
import { getOnboardingTemplates } from "@/lib/data/templates";
import { LandingSection } from "./shared";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { LANDING_CARD_CLASS, LANDING_HEADING_CLASS, LANDING_REVEAL_CLASS, LANDING_SECTION_TITLE_LEFT_CLASS, LANDING_BODY_CLASS } from "./landing-animation-classes";
import { useLandingScrollAnimations } from "./use-landing-scroll-animations";

const FEATURED_TEMPLATE_IDS = ["1", "2", "5", "9"];

const Templates = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const templates = FEATURED_TEMPLATE_IDS.map((id) =>
    getOnboardingTemplates().find((template) => template.id === id),
  ).filter((template) => template != null);

  useLandingScrollAnimations(sectionRef, {
    staggerReveal: 0.12,
    cardsOnViewIndividually: true,
    cardStart: "top 88%",
  });

  if (!templates.length) return null;

  return (
    <LandingSection ref={sectionRef} id="templates">
      <div className="flex flex-col md:flex-row justify-between text-center">
        <div className="flex justify-start">
          <h2
            data-animate-reveal
            className={`${LANDING_HEADING_CLASS} ${LANDING_SECTION_TITLE_LEFT_CLASS} md:text-left ${LANDING_REVEAL_CLASS}`}
          >
            Темплейта е старт, а не финал
          </h2>
        </div>
        <p
          data-animate-reveal
          className={`mt-4 max-w-lg md:text-left ${LANDING_BODY_CLASS} ${LANDING_REVEAL_CLASS}`}
        >
          Избери един от доказаните ни стартиращи темплейти по твой вкус. След това го адаптираме спрямо твоя бизнес.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:mt-14">
        {templates.map((template, index) => (
          <div
            key={`${template.category}-${template.id}`}
            data-animate-card
            className={LANDING_CARD_CLASS}
          >
            <TemplateCard template={template} priority={index === 0} />
          </div>
        ))}
      </div>
      <div data-animate-reveal className={`text-center ${LANDING_REVEAL_CLASS}`}>
        <TrackedCtaLink href="/templates" ctaId="service_ready_store_browse_templates">
          <Button variant="outline" size="xl" type="button" className="gap-2">
            Виж всички шаблони
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </TrackedCtaLink>
      </div>
    </LandingSection>
  );
};

export default Templates;
