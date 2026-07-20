"use client";

import { useRef } from "react";
import HeroVideo from "@/components/services/service-detail-ready-store-v2/HeroVideo";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import { cn } from "@/lib/utils";

export function ThreeFreeTipsHeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useSectionScrollAnimations(sectionRef, {
    staggerReveal: 0.12,
    animateOnMount: true,
  });

  return (
    <section
      ref={sectionRef}
      className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-8 text-center md:flex-row md:items-center md:gap-10 md:text-left lg:gap-14"
    >
      <div className="flex w-full flex-col gap-4 md:w-1/2 md:gap-6">
        <h1
          data-animate-reveal
          className={cn(
            "font-heading text-balance text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-4xl lg:text-5xl",
            LANDING_REVEAL_CLASS,
          )}
        >
          Бизнесът ти невидим ли е в Google?
        </h1>
        <p
          data-animate-reveal
          className={cn(
            "text-base leading-relaxed text-muted-foreground sm:text-lg",
            LANDING_REVEAL_CLASS,
          )}
        >
          Гледай това кратко видео, за да разбереш защо не се класираш в топ 3.
        </p>
        <p
          data-animate-reveal
          className={cn(
            "text-base font-bold leading-relaxed text-foreground sm:text-lg",
            LANDING_REVEAL_CLASS,
          )}
        >
          Запиши се по-долу, за да получиш три БЕЗПЛАТНИ съвета, които можеш да приложиш още днес и
          да започнеш да се изкачваш нагоре. ⬇️
        </p>
        <form
          data-animate-reveal
          className={cn(
            "mx-auto flex w-full max-w-md flex-col gap-2 sm:flex-row md:mx-0",
            LANDING_REVEAL_CLASS,
          )}
        >
          <input
            type="email"
            name="email"
            required
            placeholder="name@email.com"
            autoComplete="off"
            className="h-[50px] w-full rounded-lg border border-border bg-white px-4 text-base text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <button
            type="submit"
            className="h-[50px] shrink-0 rounded-lg bg-accent px-5 text-base font-semibold text-accent-foreground transition hover:opacity-90 sm:px-6"
          >
            Абонирай се
          </button>
        </form>
      </div>
      <div data-animate-reveal className={cn("w-full md:w-1/2", LANDING_REVEAL_CLASS)}>
        <HeroVideo
          videoId="9giP4v2PfxE"
          title="3 безплатни съвета за по-високо класиране в Google"
          thumbnailSrc="/video-thumbnail.png"
          muteOnPlay
        />
      </div>
    </section>
  );
}
