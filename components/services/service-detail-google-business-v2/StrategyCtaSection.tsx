"use client";

import { useRef } from "react";
import { ArrowRight, Gift } from "lucide-react";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import { cn } from "@/lib/utils";
import { gbContainerClass } from "./shared";

export function StrategyCtaSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useSectionScrollAnimations(sectionRef, {
    staggerReveal: 0.1,
    itemStart: "top 88%",
  });

  return (
    <section
      ref={sectionRef}
      id="strategy-cta"
      className="relative overflow-hidden py-12 md:py-28"
    >
      <div className={gbContainerClass}>
        <div
          data-animate-reveal
          className={cn(
            "relative overflow-hidden rounded-4xl bg-foreground px-6 py-12 text-center text-background md:rounded-[2.5rem] md:px-12 md:py-16",
            LANDING_REVEAL_CLASS,
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
          />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-background/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <Gift className="h-3.5 w-3.5" strokeWidth={2.4} />
              Безплатно
            </span>

            <h2 className="mt-5 font-heading text-3xl font-bold tracking-tight md:text-5xl">
              Запази безплатна стратегическа консултация
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-background/75 md:text-lg">
              Ако това звучи като това, от което бизнесът ти има нужда - нека
              поговорим. Резервирай кратък разговор с екипа ни и ще ти покажем
              точно как бихме те извели в топ 3.
            </p>

            <a
              href="#booking"
              className="group mt-8 inline-flex h-14 items-center gap-3 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-(--shadow-glow) transition-transform hover:scale-[1.03]"
            >
              Запази стратегически разговор
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
