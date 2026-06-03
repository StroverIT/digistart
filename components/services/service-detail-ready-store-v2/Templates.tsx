"use client";

import { useRef } from "react";
import { TemplateCard } from "@/components/templates/template-card";
import { getOnboardingTemplates } from "@/lib/data/templates";
import { LandingSection } from "./shared";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { LANDING_REVEAL_CLASS, LANDING_CARD_CLASS } from "./landing-animation-classes";
import { useLandingScrollAnimations } from "./use-landing-scroll-animations";

const Templates = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const templates = getOnboardingTemplates();

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
            className={`max-w-md text-5xl font-bold md:text-left ${LANDING_REVEAL_CLASS}`}
          >
            Темплейта е старт, а не финал
          </h2>
        </div>
        <p
          data-animate-reveal
          className={`mt-4 max-w-lg text-base text-muted-foreground sm:text-2xl md:text-left ${LANDING_REVEAL_CLASS}`}
        >
          Избери един от доказаните ни стартиращи темплейти по твой вкус. След това го адаптираме спрямо твоя бизнес.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:mt-14">
        {templates.slice(0, 4).map((template, index) => (
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
        <Button variant="outline" size="xl" type="button" className="gap-2">
          Виж всички шаблони
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    </LandingSection>
  );
};

export default Templates;
