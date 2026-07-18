"use client";

import { useRef } from "react";
import { BarChart3, ClipboardList, MessageCircle, Rocket } from "lucide-react";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import { cn } from "@/lib/utils";
import { gbContainerClass, gbLabelClass } from "./shared";

const STEPS = [
  {
    icon: MessageCircle,
    title: "Стратегически разговор",
    description:
      "Запази безплатен разговор, за да оценим пазара ти и текущите позиции в Google.",
  },
  {
    icon: ClipboardList,
    title: "Онбординг",
    description:
      "Изпращаме ясни инструкции как да ни дадеш сигурен достъп до профила ти.",
  },
  {
    icon: Rocket,
    title: "Изпълнение",
    description:
      "Минаваме през всяка стъпка от процеса, за да напълним календара ти с реални запитвания.",
  },
  {
    icon: BarChart3,
    title: "Какво работи?",
    description:
      "Следим релевантни данни, за да видим какво реално носи резултат - и правим повече от него.",
  },
] as const;

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useSectionScrollAnimations(sectionRef, {
    staggerReveal: 0.1,
    itemStart: "top 88%",
    stepsOnViewIndividually: true,
  });

  return (
    <section
      ref={sectionRef}
      id="steps"
      className="relative overflow-hidden py-12 md:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-muted/40"
      />

      <div className={gbContainerClass}>
        <div className="mx-auto max-w-2xl text-center">
          <span
            data-animate-reveal
            className={cn(gbLabelClass, LANDING_REVEAL_CLASS)}
          >
            Как работи?
          </span>
          <h2
            data-animate-reveal
            className={cn(
              "mt-5 font-heading text-2xl font-bold tracking-tight text-foreground md:text-4xl",
              LANDING_REVEAL_CLASS,
            )}
          >
            Доста е{" "}
            <span className="font-accent font-normal italic text-accent">лесно.</span>
          </h2>
        </div>

        <ol className="relative mx-auto mt-8 max-w-2xl md:mt-14">
          <div
            aria-hidden
            className="absolute left-5.5 top-3 bottom-3 w-px bg-border"
          />

          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const number = String(index + 1).padStart(2, "0");
            const isLast = index === STEPS.length - 1;

            return (
              <li
                key={step.title}
                data-animate-step
                className={cn(
                  "relative flex gap-5",
                  !isLast && "pb-7 md:pb-12",
                  LANDING_REVEAL_CLASS,
                )}
              >
                <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground ring-4 ring-background">
                  <Icon className="h-5 w-5" strokeWidth={2.2} />
                </div>

                <div className="min-w-0 pt-1">
                  <span className="font-heading text-xs font-bold tracking-[0.18em] text-accent">
                    {number}
                  </span>
                  <h3 className="mt-1 font-heading text-xl font-bold text-foreground md:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-foreground/80">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <blockquote
          data-animate-step
          className={cn(
            "mx-auto mt-10 max-w-3xl border-l-4 border-accent pl-6 md:mt-14 md:pl-8",
            LANDING_REVEAL_CLASS,
          )}
        >
          <p className="font-accent text-xl leading-snug text-foreground md:text-2xl">
            Докато мислиш дали си заслужава - конкурентът ти вече е в топ 3 и
            взема твоите клиенти.
          </p>
        </blockquote>
      </div>
    </section>
  );
}
