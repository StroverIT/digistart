"use client";

import { useRef } from "react";
import { AlertTriangle, ArrowRight, Compass, Target, Wrench } from "lucide-react";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import { cn } from "@/lib/utils";

const PRIORITIES = [
  {
    icon: Target,
    title: "Целева аудитория",
    description: "Кой точно купува от теб и защо точно от теб, а не от конкурента.",
    trap: false,
  },
  {
    icon: Compass,
    title: "Маркетингова стратегия",
    description: "План как да достигнеш точните хора и да ги превърнеш в клиенти.",
    trap: false,
  },
  {
    icon: Wrench,
    title: "„Инструменти“",
    description: "Сайт, магазин, реклами — важни, но чак на трето място.",
    trap: true,
  },
] as const;

export function PrioritiesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useSectionScrollAnimations(sectionRef, {
    staggerReveal: 0.1,
    itemStart: "top 88%",
  });

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-20 md:py-28">
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

      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span
            data-animate-reveal
            className={cn(
              "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent",
              LANDING_REVEAL_CLASS,
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Истината, която никой не ти казва
          </span>
          <h2
            data-animate-reveal
            className={cn(
              "mt-5 font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl",
              LANDING_REVEAL_CLASS,
            )}
          >
            Вече продаваш или искаш да започнеш?
          </h2>
          <p
            data-animate-reveal
            className={cn(
              "mt-4 text-base text-muted-foreground md:text-lg",
              LANDING_REVEAL_CLASS,
            )}
          >
            При двете ситуации са ти нужни едни и същи три неща.
          </p>
        </div>

        <ol className="relative mx-auto mt-14 max-w-2xl">
          <div
            aria-hidden
            className="absolute left-[1.375rem] top-3 bottom-3 w-px bg-border"
          />

          {PRIORITIES.map((item, index) => {
            const Icon = item.icon;
            const step = String(index + 1).padStart(2, "0");
            const isLast = index === PRIORITIES.length - 1;

            return (
              <li
                key={item.title}
                data-animate-reveal
                className={cn(
                  "relative flex gap-5",
                  !isLast && "pb-10 md:pb-12",
                  LANDING_REVEAL_CLASS,
                )}
              >
                <div
                  className={cn(
                    "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-4 ring-background",
                    item.trap
                      ? "bg-muted text-muted-foreground"
                      : "bg-accent text-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.2} />
                </div>

                <div className="min-w-0 pt-1">
                  <span
                    className={cn(
                      "font-heading text-xs font-bold tracking-[0.18em]",
                      item.trap ? "text-muted-foreground" : "text-accent",
                    )}
                  >
                    {step}
                  </span>
                  <h3
                    className={cn(
                      "mt-1 font-heading text-xl font-bold md:text-2xl",
                      item.trap
                        ? "text-muted-foreground line-through decoration-destructive/40"
                        : "text-foreground",
                    )}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={cn(
                      "mt-2 text-base leading-relaxed",
                      item.trap ? "text-muted-foreground" : "text-foreground/80",
                    )}
                  >
                    {item.description}
                  </p>
                  {item.trap && (
                    <p className="mt-2 text-sm font-semibold text-destructive">
                      Тук скачат 95% от бизнесите.
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <blockquote
          data-animate-reveal
          className={cn(
            "mx-auto mt-10 max-w-3xl border-l-4 border-accent pl-6 md:mt-14 md:pl-8",
            LANDING_REVEAL_CLASS,
          )}
        >
          <p className="font-accent text-xl leading-snug text-foreground md:text-2xl">
            Създаваш най-добрия онлайн магазин, социална мрежа или SEO — но без
            аудитория и стратегия е все едно да си най-добрият оратор и да говориш
            на стената.
          </p>
        </blockquote>

        <div
          data-animate-reveal
          className={cn(
            "relative mt-14 overflow-hidden rounded-[2rem] bg-foreground px-6 py-10 text-background md:mt-16 md:rounded-[2.5rem] md:px-10 md:py-12 lg:px-14 lg:py-14",
            LANDING_REVEAL_CLASS,
          )}
        >
          <div
            aria-hidden
            className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/25 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
          />

          <div className="relative mx-auto max-w-5xl">
            <div className="space-y-3 border-b border-background/10 pb-8 md:pb-10">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.4} />
                Ако изчакаш
              </div>
              <p className="font-heading text-xl font-bold leading-snug tracking-tight text-background md:text-2xl lg:text-[1.75rem] lg:leading-snug">
                Конкурентът ти вече го прави.
                <br />
                Който го направи най-бързо и най-добре, взема най-големия пазарен дял.
              </p>
            </div>

            <div className="flex flex-col gap-8 pt-8 md:pt-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
              <div className="min-w-0 max-w-2xl space-y-6">
                <div>
                  <h3 className="font-heading text-2xl font-bold md:text-3xl">
                    Какво предлагаме?
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-background/80 md:text-lg">
                    Ще ти изградим{" "}
                    <span className="font-semibold text-background">
                      целевата аудитория
                    </span>{" "}
                    и{" "}
                    <span className="font-semibold text-background">
                      маркетинговата стратегия
                    </span>
                    . Ако искаш — и изпълнението.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold md:text-3xl">
                    Защо ние?
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-background/80 md:text-lg">
                    <span className="text-primary">9 години</span> в сайтове, онлайн
                    магазини и SEO, и{" "}
                    <span className="text-primary">3 години</span> в реклами и
                    социални мрежи.
                  </p>
                </div>
              </div>

              <a
                href="#booking"
                className="group inline-flex h-14 shrink-0 items-center gap-3 self-start rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03] lg:self-end"
              >
                Запиши безплатна консултация
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
