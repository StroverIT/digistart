"use client";

import { useRef } from "react";
import Image from "next/image";
import { ClipboardList, LineChart, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingSection } from "@/components/services/service-detail-ready-store-v2/shared";
import {
  LANDING_REVEAL_CLASS,
  LANDING_CARD_CLASS,
} from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useLandingScrollAnimations } from "@/components/services/service-detail-ready-store-v2/use-landing-scroll-animations";

const reportFeatures = [
  {
    icon: Target,
    title: "Къде отидоха парите",
    description: "Виждаш разхода спрямо поръчките, не само кликове.",
  },
  {
    icon: ClipboardList,
    title: "Кои продукти работят",
    description: "Казваме кои артикули носят интерес и кои спираме.",
  },
  {
    icon: Users,
    title: "Колко поръчки идват",
    description: "Следим покупки, колички и качествени посещения.",
  },
  {
    icon: LineChart,
    title: "Какво правим после",
    description: "План: нов тест, ретаргет или повече бюджет към продаващото.",
  },
] as const;

const ReportsPanel = () => {
  const sectionRef = useRef<HTMLElement>(null);
  useLandingScrollAnimations(sectionRef, { staggerReveal: 0.1, staggerCard: 0.12 });

  return (
    <LandingSection ref={sectionRef} id="reports" className="pb-0!">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 lg:gap-12">
        <h1
          data-animate-reveal
          className={`max-w-3xl font-heading text-2xl font-bold tracking-tight text-foreground md:max-w-lg lg:leading-tight ${LANDING_REVEAL_CLASS}`}
        >
          Виждаш кои реклами носят онлайн продажби
        </h1>
        <div data-animate-reveal className={LANDING_REVEAL_CLASS}>
          <Button
            asChild
            size="sm"
            className="shrink-0 self-center rounded-full px-8 text-sm font-semibold shadow-lg shadow-primary/20"
          >
            <a href="#booking">Стартирай сега</a>
          </Button>
        </div>
      </div>

      <ul className="mt-12 grid list-none gap-10 p-0 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-0">
        {reportFeatures.map((feature) => (
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
            src="/dashboard-ads.png"
            alt="Отчети за Google и Meta реклами"
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

export default ReportsPanel;
