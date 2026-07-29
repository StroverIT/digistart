"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Globe2,
  MapPinned,
  Megaphone,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import { cn } from "@/lib/utils";

const SERVICES = [
  {
    href: "/services/ads",
    icon: Megaphone,
    title: "Google Ads и Meta реклами",
    description:
      "Кампании, които носят запитвания и продажби — не само кликове.",
  },
  {
    href: "/services/google-business",
    icon: MapPinned,
    title: "Google Business оптимизация",
    description:
      "Профил, който излиза при локално търсене в Google Maps и Търсене.",
  },
  {
    href: "/services/online-store",
    icon: ShoppingBag,
    title: "Онлайн магазини",
    description:
      "Магазин с автоматизация на поръчки, куриери и каталог.",
  },
  {
    href: "/services/social-media",
    icon: Sparkles,
    title: "Социални мрежи и съдържание",
    description:
      "Публикации и креативи, които подкрепят рекламите и бранда.",
  },
  {
    href: "/#location",
    icon: Globe2,
    title: "SEO и локална видимост",
    description:
      "Сайт и локално SEO, за да те намират в София, когато търсят агенция.",
  },
] as const;

export function LocalServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useSectionScrollAnimations(sectionRef, {
    staggerReveal: 0.08,
    itemStart: "top 88%",
  });

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative overflow-hidden py-20 md:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "var(--gradient-soft)" }}
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
            Услуги в София
          </span>
          <h2
            data-animate-reveal
            className={cn(
              "mt-5 font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl",
              LANDING_REVEAL_CLASS,
            )}
          >
            Какво прави рекламна агенция DigiStart
          </h2>
          <p
            data-animate-reveal
            className={cn(
              "mt-4 text-base text-muted-foreground md:text-lg",
              LANDING_REVEAL_CLASS,
            )}
          >
            Google Ads, Meta, SEO, Google Business и онлайн магазини — стратегия и
            изпълнение от един екип.
          </p>
        </div>

        <ul className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <li key={service.href} data-animate-reveal className={LANDING_REVEAL_CLASS}>
                <Link
                  href={service.href}
                  className="group flex h-full flex-col rounded-2xl border border-border/80 bg-card/80 p-5 transition-colors hover:border-primary/30 hover:bg-card"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                    {service.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                    Виж повече
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
