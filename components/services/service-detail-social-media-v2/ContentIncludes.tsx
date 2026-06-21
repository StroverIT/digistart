"use client";

import { useRef } from "react";
import { CalendarDays, MessageCircleReply, PenLine, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingSection } from "@/components/services/service-detail-ready-store-v2/shared";
import {
  LANDING_REVEAL_CLASS,
  LANDING_CARD_CLASS,
} from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useLandingScrollAnimations } from "@/components/services/service-detail-ready-store-v2/use-landing-scroll-animations";
import { ImagePlaceholder } from "./ImagePlaceholder";

const packageFeatures = [
  {
    icon: CalendarDays,
    title: "Месечен план за съдържание",
    description: "Знаеш какво публикуваме и кога - без изненади и без дупки.",
  },
  {
    icon: Sparkles,
    title: "Дизайн и обработка на снимки",
    description: "Селекция, брандиране и визии, готови за Instagram и Facebook.",
  },
  {
    icon: PenLine,
    title: "Продаващи текстове",
    description: "Copywriting с ясна цел и призив за действие във всеки пост.",
  },
  {
    icon: MessageCircleReply,
    title: "Разговорите са наша работа",
    description:
      'Когато клиент пише „Интересувам се" или пита за наличност, отговаряме ние от твоето име – ти не прекъсваш деня си със съобщения.',
  },
] as const;

const ContentIncludes = () => {
  const sectionRef = useRef<HTMLElement>(null);
  useLandingScrollAnimations(sectionRef, { staggerReveal: 0.1, staggerCard: 0.12 });

  return (
    <LandingSection ref={sectionRef} id="reports" className="pb-0!">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 lg:gap-12">
        <h1
          data-animate-reveal
          className={`max-w-3xl font-heading text-2xl font-bold tracking-tight text-foreground md:max-w-lg lg:leading-tight ${LANDING_REVEAL_CLASS}`}
        >
          Базов пакет: изграждане и поддръжка на дигиталната ти витрина
        </h1>
        <div data-animate-reveal className={LANDING_REVEAL_CLASS}>
          <Button
            asChild
            size="sm"
            className="shrink-0 self-center rounded-full px-8 text-sm font-semibold shadow-lg shadow-primary/20"
          >
            <a href="#buy-now">Започни сега</a>
          </Button>
        </div>
      </div>

      <ul className="mt-12 grid list-none gap-10 p-0 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-0">
        {packageFeatures.map((feature) => (
          <li
            key={feature.title}
            data-animate-card
            className={`flex flex-col lg:border-l lg:px-10 ${LANDING_CARD_CLASS}`}
          >
            <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <feature.icon className="size-5" aria-hidden />
            </span>
            <h2 className="font-heading text-sm font-bold">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-xs">
              {feature.description}
            </p>
          </li>
        ))}
      </ul>

      <div
        data-animate-card
        className={`relative mx-auto w-full ${LANDING_CARD_CLASS}`}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="glow-blob blob-left" />
          <div className="glow-blob blob-right" />
        </div>

        <div className="relative z-10 w-full rounded-3xl md:-mt-22 lg:-mt-38">
          <ImagePlaceholder
            width={1920}
            height={1200}
            label="Визуализация на базовия пакет социални мрежи"
            className="rounded-3xl"
          />
        </div>
      </div>
    </LandingSection>
  );
};

export default ContentIncludes;
