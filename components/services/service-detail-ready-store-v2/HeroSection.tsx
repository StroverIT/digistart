"use client";

import { useRef } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingSection } from "./shared";
import {
  LANDING_REVEAL_CLASS,
  LANDING_CARD_CLASS,
  LANDING_GLASS_CLASS,
  LANDING_GLASS_ACCENT_CLASS,
} from "./landing-animation-classes";
import { useLandingScrollAnimations } from "./use-landing-scroll-animations";
import { LazyYouTubeEmbed } from "./lazy-youtube-embed";
import GoogleReviewsSection from "./GoogleReviewsSection";

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  useLandingScrollAnimations(sectionRef, { staggerReveal: 0.14, staggerCard: 0.2 });

  return (
    <LandingSection ref={sectionRef} className="border-b-0 bg-linear-to-b from-white to-primary md:pt-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 lg:items-center lg:gap-16">
        <div className="flex w-full flex-col items-center text-center">
          <p
            data-animate-reveal
            className={`text-sm font-semibold uppercase tracking-widest text-primary ${LANDING_REVEAL_CLASS}`}
          >
            Адаптивен онлайн магазин
          </p>
          <h1
            data-animate-reveal
            className={`font-heading mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1] ${LANDING_REVEAL_CLASS}`}
          >
            Пусни. Продавай. Адаптирай.
          </h1>
          <p
            data-animate-reveal
            className={`mt-4 max-w-lg text-2xl text-muted-foreground ${LANDING_REVEAL_CLASS}`}
          >
            Вземи всичко необходимо за изграждане на онлайн продажби
          </p>
          <div
            data-animate-reveal
            className={`mt-8 flex flex-col items-center gap-3 lg:items-start ${LANDING_REVEAL_CLASS}`}
          >
            <Button size="lg" className="h-12 rounded-full px-8 text-base font-semibold shadow-lg shadow-primary/20">
              Започни безплатно
            </Button>
            <p className="text-sm text-muted-foreground">Пробният период е 14 дни.</p>
          </div>
          <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3 lg:justify-start">
            {["Онлайн плащания", "Лесно за настройсване", "Оптимизиран за мобилни устройства"].map(
              (item) => (
                <li
                  key={item}
                  data-animate-reveal
                  className={`flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-medium text-foreground ${LANDING_GLASS_CLASS} ${LANDING_REVEAL_CLASS}`}
                >
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-foreground ${LANDING_GLASS_ACCENT_CLASS}`}
                  >
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        <article data-animate-card className={`w-full flex-1 ${LANDING_CARD_CLASS}`}>
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-muted/40 p-2 shadow-xl shadow-primary/5 sm:p-3">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-background">
              <LazyYouTubeEmbed
                videoId="mMNGqvyngLE"
                title="YouTube video player"
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        </article>
      </div>
      <GoogleReviewsSection />
    </LandingSection>
  );
};

export default HeroSection;
