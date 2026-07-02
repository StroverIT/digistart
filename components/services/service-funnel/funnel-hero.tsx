"use client";

import { ArrowRight, Handshake, Moon, Package, ShoppingBag, Store, type LucideIcon } from "lucide-react";
import { SiteLogo } from "@/components/layout/site-logo";
import GoogleReviewsSection from "@/components/services/service-detail-ready-store-v2/GoogleReviewsSection";
import { landingContainerClass } from "@/components/services/service-detail-ready-store-v2/shared";
import {
  funnelWaveFills,
  SectionWave,
} from "@/components/services/service-funnel/section-wave";
import type { ServiceFunnelConfig } from "@/config/service-funnels/types";
import { cn } from "@/lib/utils";

const DEFAULT_WHO_IS_IT_FOR_ICONS: LucideIcon[] = [Handshake, Store];
const ONLINE_STORE_DREAM_ICONS: LucideIcon[] = [Moon, ShoppingBag, Package];

function resolveWhoIsItForIcons(config: ServiceFunnelConfig): LucideIcon[] {
  if (config.serviceId === "ready-store") {
    return ONLINE_STORE_DREAM_ICONS;
  }
  return DEFAULT_WHO_IS_IT_FOR_ICONS;
}

type FunnelHeroProps = {
  config: ServiceFunnelConfig;
};

export function FunnelHero({ config }: FunnelHeroProps) {
  const { hero, whoIsItFor, features, checkout } = config;
  const whoIsItForIcons = resolveWhoIsItForIcons(config);
  const showHeroDescription = features?.showHeroDescription ?? false;
  const showProcessStepsSection = features?.showProcessStepsSection ?? false;
  const ctaHref = checkout ? "#checkout" : "#booking";

  return (
    <>
      <section className="scroll-mt-28 overflow-visible border-b-0 bg-linear-to-b from-white to-primary/50 pt-0 pb-0">
        <div className={cn(landingContainerClass, "pt-site-header pb-8 md:pb-10 lg:pb-12")}>
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 text-center sm:gap-6 md:gap-8">
            <SiteLogo className="justify-center" />
            <h1 className="font-heading max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              {hero.title}
            </h1>
            <p className="font-heading max-w-2xl text-xl font-semibold text-foreground sm:text-2xl">
              {hero.subtitle}
            </p>
            {showHeroDescription && hero.description ? (
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {hero.description}
              </p>
            ) : null}

            <a
              href={ctaHref}
              className="group inline-flex h-12 w-full max-w-sm items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100 sm:w-auto"
            >
              {hero.ctaLabel}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="mt-12 md:mt-16 lg:mt-20">
            <GoogleReviewsSection />
          </div>
        </div>
        <SectionWave fillClassName={funnelWaveFills.lavender} />
      </section>

      <section
        id="who-is-it-for"
        aria-labelledby="who-is-it-for-heading"
        className="bg-[#F8F7FF] pt-10 pb-10 md:pt-12 md:pb-12"
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="mx-auto max-w-5xl">
            <header className="mx-auto max-w-2xl text-center">
              <h2
                id="who-is-it-for-heading"
                className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance text-foreground md:text-4xl"
              >
                {whoIsItFor.title}
              </h2>
              {whoIsItFor.subtitle ? (
                <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
                  {whoIsItFor.subtitle}
                </p>
              ) : null}
            </header>

            <div className="mt-10 grid gap-5 sm:gap-6 md:mt-12 md:grid-cols-2 md:gap-8">
              {whoIsItFor.items.map((item, index) => {
                const Icon = whoIsItForIcons[index] ?? Handshake;
                const isLastOdd =
                  whoIsItFor.items.length % 2 === 1 && index === whoIsItFor.items.length - 1;

                return (
                  <article
                    key={item.title}
                    className={cn(
                      "group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(15,23,42,0.05)] ring-1 ring-border/50 transition-all duration-300",
                      "hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)] hover:ring-[#A8E6CF]/60 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                      "md:p-8",
                      isLastOdd && "md:col-span-2 md:mx-auto md:max-w-xl",
                    )}
                  >
                    <div
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#A8E6CF] via-[#A8E6CF]/80 to-primary/30"
                    />

                    <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#A8E6CF]/25 text-[#2D5C4A] ring-1 ring-[#A8E6CF]/35 transition-colors group-hover:bg-[#A8E6CF]/35">
                      <Icon className="size-5" strokeWidth={2.25} aria-hidden />
                    </span>

                    <h3 className="mt-5 font-heading text-lg font-bold leading-snug text-foreground md:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground md:text-base">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
        {showProcessStepsSection ? (
          <SectionWave fillClassName={funnelWaveFills.process} />
        ) : null}
      </section>
    </>
  );
}
