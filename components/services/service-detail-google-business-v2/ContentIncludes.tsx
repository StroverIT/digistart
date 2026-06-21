"use client";

import { useRef } from "react";
import Image from "next/image";
import { Camera, MapPin, Route, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingSection } from "@/components/services/service-detail-ready-store-v2/shared";
import {
  LANDING_REVEAL_CLASS,
  LANDING_CARD_CLASS,
} from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useLandingScrollAnimations } from "@/components/services/service-detail-ready-store-v2/use-landing-scroll-animations";

const packageFeatures = [
  {
    icon: ShieldCheck,
    title: "Верификация и категории",
    description: "Създаваме или оптимизираме профила и помагаме с официалната верификация.",
  },
  {
    icon: MapPin,
    title: "Локално SEO",
    description: "Описание, ключови думи и настройки, за да излизаш при локални заявки.",
  },
  {
    icon: Camera,
    title: "Снимки и дигитална витрина",
    description: "Работно време, контакти, снимки, линкове и обслужвани зони на едно място.",
  },
  {
    icon: Route,
    title: "От търсене до прага",
    description:
      "Бутони за обаждане, маршрут и линк към мястото, където клиентът поръчва – Instagram, OLX или онлайн магазин.",
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
          Базов пакет: Google Business настройка
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
        className={`relative mx-auto aspect-16/10 w-full max-w-6xl ${LANDING_CARD_CLASS}`}
      >
        <div className="glow-blob blob-left"></div>
        <div className="glow-blob blob-right"></div>

        <div className="relative z-10 h-full w-full rounded-3xl md:-mt-22 lg:-mt-38">
          <Image
            src="/dashboard-google-business.png"
            alt="Визуализация на Google Business настройката"
            fill
            className="object-contain object-bottom"
            sizes="(max-width: 1280px) 100vw, 1152px"
            loading="lazy"
          />
        </div>
      </div>
    </LandingSection>
  );
};

export default ContentIncludes;
