"use client";

import { TemplateCard } from "@/components/templates/template-card";
import { getOnboardingTemplates } from "@/lib/data/templates";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { LandingSection, LandingSectionTitle } from "./shared";

const Templates = () => {
  const templates = getOnboardingTemplates();

  if (!templates.length) return null;

  return (
    <LandingSection id="templates">
      <div className="mx-auto max-w-3xl text-center">
        <LandingSectionTitle as="h2">
          Избери темплейт за твоя магазин
        </LandingSectionTitle>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          Темплейта е старт, а не финал. Избери темплейт който ти пасва на твоя бранд. След това го
          адаптираме към твоя бизнес.
        </p>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          NOTE: Ако нищо не ти харесва, просто избери някой и ние ще направим останалото за теб.
        </p>
      </div>

      <div className="relative mt-10 md:mt-14">
        <Carousel
          opts={{ align: "start", loop: true }}
          className="w-full"
        >
          <CarouselContent className="-ml-3 md:-ml-4">
            {templates.map((template) => (
              <CarouselItem
                key={`${template.category}-${template.id}`}
                className="basis-[85%] pl-3 sm:basis-[55%] md:basis-[42%] md:pl-4 lg:basis-[32%]"
              >
                <TemplateCard
                  template={template}
                  className="rounded-2xl border border-border/80 bg-card p-3 shadow-md transition-shadow hover:shadow-lg"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 hidden border-border bg-background shadow-md md:flex" />
          <CarouselNext className="right-0 hidden border-border bg-background shadow-md md:flex" />
        </Carousel>
      </div>
    </LandingSection>
  );
};

export default Templates;
