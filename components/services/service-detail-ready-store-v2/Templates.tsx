"use client";

import { TemplateCard } from "@/components/templates/template-card";
import { getOnboardingTemplates } from "@/lib/data/templates";

import { LandingSection } from "./shared";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

const Templates = () => {
  const templates = getOnboardingTemplates();

  if (!templates.length) return null;

  return (
    <LandingSection id="templates">
      <div className="text-center flex justify-between">
        <div className="flex justify-start">
          <h2 className="md:text-left text-5xl font-bold max-w-md">
            Темплейта е старт, а не финал
          </h2>
        </div>
        <p className="mt-4 text-base text-muted-foreground sm:text-2xl md:text-left max-w-lg">
          Избери един от доказаните ни стартиращи темплейти по твой вкус. След това го адаптираме спрямо твоя бизнес.
        </p>

      </div>
      <p className="text-sm text-muted-foreground sm:text-base text-center mt-4 max-w-lg mx-auto">
        NOTE: Темплейта ни помага на нас да разберем повече за твоя бизнес, така стратираме по-бързо. Ако нищо не ти допада, просто избери някой и ние ще направим останалото за теб.
      </p>

      <div className=" mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2">
        {templates.slice(0, 4).map((template) => (
          <TemplateCard
            template={template}
            key={`${template.category}-${template.id}`}
          />
        ))}
      </div>
      <div className="text-center">
        <Button variant="outline" size="xl" type="button" className="gap-2">
          Виж всички шаблони
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    </LandingSection>
  );
};

export default Templates;
