"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  LANDING_CARD_CLASS,
  LANDING_REVEAL_CLASS,
} from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import { cn } from "@/lib/utils";

type CaseStudyProps = {
  className?: string;
};

export function CaseStudy({ className }: CaseStudyProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useSectionScrollAnimations(sectionRef, {
    staggerReveal: 0.1,
    cardsOnViewIndividually: true,
    itemStart: "top 85%",
  });

  return (
    <section
      ref={sectionRef}
      id="results"
      className={cn("container mx-auto px-4 py-20 md:px-8 md:py-28", className)}
    >
      <div className="mx-auto max-w-2xl text-center">
        <span
          data-animate-reveal
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-accent/20 bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent",
            LANDING_REVEAL_CLASS,
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Доказани резултати
        </span>
        <h2
          data-animate-reveal
          className={cn(
            "mt-5 font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl",
            LANDING_REVEAL_CLASS,
          )}
        >
          Успешният пример: Restyled
        </h2>
        <p
          data-animate-reveal
          className={cn("mt-4 text-base text-muted-foreground md:text-lg", LANDING_REVEAL_CLASS)}
        >
          От хаос в чата до автоматизирана машина за поръчки.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div
            data-animate-card
            className={cn(
              "rounded-3xl border border-destructive/20 bg-card p-7",
              LANDING_CARD_CLASS,
            )}
          >
            <div className="text-xs font-bold uppercase tracking-widest text-destructive lg:text-sm">
              Преди
            </div>
            <ul className="mt-4 space-y-3 text-sm text-black lg:text-base lg:leading-relaxed">
              <li>• Хаос в чата, ръчна комуникация за всеки размер и адрес.</li>
              <li>• Трудно управление на 500+ продукта.</li>
              <li>• Рекламите говореха към грешната аудитория.</li>
              <li>• Собственикът – единствената движеща сила на бизнеса.</li>
            </ul>
          </div>
          <div
            data-animate-card
            className={cn(
              "rounded-3xl border border-primary/30 bg-card p-7",
              LANDING_CARD_CLASS,
            )}
          >
            <div className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground lg:text-sm">
              След DigiStart
            </div>
            <ul className="mt-4 space-y-3 text-sm text-black lg:text-base lg:leading-relaxed">
              <li>• ~90 автоматизирани поръчки на месец.</li>
              <li>• Каталог с 10 000+ продукта.</li>
              <li>• Поддържаме социалните мрежи и рекламата – отговаряме вместо него.</li>
              <li>• Остава само качване на нови артикули и пакетиране.</li>
            </ul>
          </div>
        </div>

        <div
          data-animate-reveal
          className={cn(
            "w-full lg:sticky lg:top-24 lg:self-start",
            LANDING_REVEAL_CLASS,
          )}
        >
          <Image
            src="/restyled-mockup.png"
            alt="Restyled онлайн магазин"
            width={2160}
            height={1280}
            unoptimized
            className="h-auto w-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}
