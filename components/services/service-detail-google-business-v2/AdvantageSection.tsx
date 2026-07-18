"use client";

import { useRef } from "react";
import { Clock3, Eye, Wallet } from "lucide-react";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import { cn } from "@/lib/utils";
import { gbContainerClass, gbLabelClass } from "./shared";

const ADVANTAGES = [
  {
    icon: Eye,
    title: "Видимост",
    description:
      "75% от потенциалните клиенти, търсещи вашите услуги, се насочват към първите 3 резултата. Ако не сте сред тях, оставате невидими.",
  },
  {
    icon: Wallet,
    title: "Безплатно",
    description:
      "Няма разходи за клик или огромни рекламни бюджети, каквито се изискват при Google Ads, Meta Ads и подобни платформи.",
  },
  {
    icon: Clock3,
    title: "Дългосрочна стратегия",
    description:
      "Веднъж щом достигнете до топ 3, обикновено се задържате там с години – и то без никакви допълнителни месечни разходи.",
  },
] as const;

export function AdvantageSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useSectionScrollAnimations(sectionRef, {
    staggerReveal: 0.1,
    itemStart: "top 88%",
  });

  return (
    <section
      ref={sectionRef}
      id="advantage"
      className="relative overflow-hidden py-12 md:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "var(--gradient-soft)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-32 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
      />

      <div className={gbContainerClass}>
        <div className="mx-auto max-w-2xl text-center">
          <span
            data-animate-reveal
            className={cn(gbLabelClass, LANDING_REVEAL_CLASS)}
          >
            Предимството
          </span>
          <h2
            data-animate-reveal
            className={cn(
              "mt-5 font-heading text-2xl font-normal tracking-tight text-foreground md:text-4xl",
              LANDING_REVEAL_CLASS,
            )}
          >
            <span className="font-bold">Но</span> дали изобщо{" "}
            <span className="font-accent italic text-accent">си заслужава?</span>
          </h2>
        </div>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 md:mt-14 lg:grid-cols-3">
          {ADVANTAGES.map((item) => {
            const Icon = item.icon;

            return (
              <li
                key={item.title}
                data-animate-reveal
                className={cn(
                  "rounded-3xl border border-border/60 bg-card p-6 shadow-(--shadow-soft) sm:p-8",
                  LANDING_REVEAL_CLASS,
                )}
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-primary/20 text-accent">
                  <Icon className="size-5" strokeWidth={2.2} />
                </span>
                <h3 className="mt-5 font-heading text-xl font-bold text-foreground md:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
