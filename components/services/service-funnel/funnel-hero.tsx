"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Clock,
  Handshake,
  Puzzle,
  ShieldCheck,
  Store,
  type LucideIcon,
} from "lucide-react";
import { SiteLogo } from "@/components/layout/site-logo";
import GoogleReviewsSection from "@/components/services/service-detail-ready-store-v2/GoogleReviewsSection";
import {
  LANDING_CARD_CLASS,
  LANDING_REVEAL_CLASS,
} from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { GoogleDriveEmbed } from "@/components/videos/google-drive-embed";
import { YoutubeEmbed } from "@/components/videos/youtube-embed";
import { useCreativesAnimations } from "@/components/services/service-detail-ads-v2/use-creatives-animations";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import { landingContainerClass } from "@/components/services/service-detail-ready-store-v2/shared";
import {
  funnelWaveFills,
  SectionWave,
} from "@/components/services/service-funnel/section-wave";
import type { ServiceFunnelConfig } from "@/config/service-funnels/types";
import { cn } from "@/lib/utils";

const DEFAULT_WHO_IS_IT_FOR_ICONS: LucideIcon[] = [Handshake, Store];
const ONLINE_STORE_PAS_ICONS: LucideIcon[] = [Puzzle, Clock, ShieldCheck];

const PAS_BADGE_STYLES: Record<string, { icon: string; accent: string }> = {
  Проблем: {
    icon: "bg-destructive/10 text-destructive ring-destructive/20 group-hover:bg-destructive/15",
    accent: "from-destructive/70 via-destructive/50 to-destructive/20",
  },
  Натиск: {
    icon: "bg-amber-100 text-amber-800 ring-amber-200/80 group-hover:bg-amber-200/80",
    accent: "from-amber-500/80 via-amber-400/60 to-amber-300/30",
  },
  Решение: {
    icon: "bg-[#A8E6CF]/25 text-[#2D5C4A] ring-[#A8E6CF]/35 group-hover:bg-[#A8E6CF]/35",
    accent: "from-[#A8E6CF] via-[#A8E6CF]/80 to-primary/30",
  },
};

function resolveWhoIsItForIcons(config: ServiceFunnelConfig): LucideIcon[] {
  if (config.serviceId === "ready-store") {
    return ONLINE_STORE_PAS_ICONS;
  }
  return DEFAULT_WHO_IS_IT_FOR_ICONS;
}

function resolvePasBadgeStyles(badge?: string) {
  if (!badge) return null;
  return PAS_BADGE_STYLES[badge] ?? null;
}

function DescriptionParagraphs({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const paragraphs = text
    .split(/\n+/)
    .flatMap((block) =>
      block
        .split(/(?<=\.)\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean),
    );

  return (
    <div
      className={cn(
        "space-y-3 text-base leading-relaxed text-foreground/90 md:text-lg",
        className,
      )}
    >
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

type FunnelHeroProps = {
  config: ServiceFunnelConfig;
};

export function FunnelHero({ config }: FunnelHeroProps) {
  const { hero, whoIsItFor, features, checkout } = config;
  const whoIsItForIcons = resolveWhoIsItForIcons(config);
  const hasPasImages = whoIsItFor.items.some((item) => item.image);
  const showHeroDescription = features?.showHeroDescription ?? false;
  const showProcessStepsSection = features?.showProcessStepsSection ?? false;
  const ctaHref = checkout ? "#checkout" : "#booking";
  const heroSectionRef = useRef<HTMLElement>(null);
  const whoSectionRef = useRef<HTMLElement>(null);

  useSectionScrollAnimations(heroSectionRef, { staggerReveal: 0.1 });
  useCreativesAnimations(whoSectionRef, { disableHorizontalOffset: hasPasImages });

  return (
    <>
      <section
        ref={heroSectionRef}
        className="scroll-mt-28 overflow-visible border-b-0 bg-linear-to-b from-white to-primary/50 pt-0 pb-0"
      >
        <div className={cn(landingContainerClass, "pt-funnel-top pb-8 md:pb-10 lg:pb-12")}>
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 text-center sm:gap-6 md:gap-8">
            <div data-animate-reveal className={LANDING_REVEAL_CLASS}>
              <SiteLogo className="justify-center" />
            </div>
            <h1
              data-animate-reveal
              className={cn(
                "font-heading max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]",
                LANDING_REVEAL_CLASS,
              )}
            >
              {hero.title}
            </h1>
            <p
              data-animate-reveal
              className={cn(
                "font-heading max-w-2xl text-xl font-semibold text-foreground sm:text-2xl",
                LANDING_REVEAL_CLASS,
              )}
            >
              {hero.subtitle}
            </p>
            {showHeroDescription && hero.description ? (
              <p
                data-animate-reveal
                className={cn(
                  "max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg",
                  LANDING_REVEAL_CLASS,
                )}
              >
                {hero.description}
              </p>
            ) : null}
          </div>

          {hero.video ? (
            <div
              data-animate-reveal
              className={cn("mx-auto mt-8 w-full sm:mt-10 md:mt-12", LANDING_REVEAL_CLASS)}
            >
              {hero.video.provider === "google-drive" ? (
                <GoogleDriveEmbed
                  fileId={hero.video.fileId}
                  title={hero.video.title}
                  thumbnailSrc={hero.video.thumbnailSrc}
                  className={cn(
                    "mx-auto shadow-lg",
                    hero.video.format === "short"
                      ? "aspect-[9/16] w-full max-w-[min(100%,360px)] sm:max-w-[min(100%,400px)]"
                      : "max-w-2xl",
                  )}
                />
              ) : (
                <YoutubeEmbed
                  youtubeId={hero.video.youtubeId}
                  title={hero.video.title}
                  className={cn(
                    "mx-auto shadow-lg",
                    hero.video.format === "short"
                      ? "aspect-[9/16] w-full max-w-[min(100%,360px)] sm:max-w-[min(100%,400px)]"
                      : "max-w-2xl",
                  )}
                />
              )}
            </div>
          ) : null}

          <div
            data-animate-reveal
            className={cn(
              "mx-auto mt-8 flex max-w-6xl justify-center sm:mt-10 md:mt-12",
              LANDING_REVEAL_CLASS,
            )}
          >
            <a
              href={ctaHref}
              className="group inline-flex h-14 w-full max-w-md items-center justify-center gap-2.5 rounded-full bg-accent px-10 text-lg font-semibold text-accent-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100 sm:w-auto md:h-16 md:px-12 md:text-xl"
            >
              {hero.ctaLabel}
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5 md:size-6" />
            </a>
          </div>

          <div
            data-animate-reveal
            className={cn("mt-12 md:mt-16 lg:mt-20", LANDING_REVEAL_CLASS)}
          >
            <GoogleReviewsSection />
          </div>
        </div>
        <SectionWave fillClassName={funnelWaveFills.lavender} />
      </section>

      <section
        ref={whoSectionRef}
        id="who-is-it-for"
        aria-labelledby="who-is-it-for-heading"
        className="overflow-hidden bg-[#F8F7FF] pt-10 pb-10 md:pt-12 md:pb-12"
      >
        <div className="container mx-auto min-w-0 px-4 md:px-8">
          <div className={cn("mx-auto min-w-0", hasPasImages ? "max-w-6xl" : "max-w-5xl")}>
            <header data-animate-reveal className={cn("mx-auto max-w-2xl text-center", LANDING_REVEAL_CLASS)}>
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

            <div
              data-animate-grid
              className={cn(
                "mt-10 min-w-0 md:mt-12",
                hasPasImages
                  ? "flex flex-col gap-14 lg:gap-20"
                  : "grid gap-5 sm:gap-6 md:grid-cols-2 md:gap-8",
              )}
            >
              {whoIsItFor.items.map((item, index) => {
                if (item.image) {
                  const imageFirst = item.imageFirst ?? false;

                  return (
                    <article
                      key={item.title}
                      data-animate-card
                      className={cn(
                        "group grid min-w-0 items-center gap-8 overflow-hidden lg:grid-cols-2 lg:gap-16",
                        LANDING_CARD_CLASS,
                      )}
                    >
                      <div
                        data-animate-card-copy
                        className={cn(
                          "order-1 min-w-0 space-y-3 opacity-0 lg:py-4",
                          imageFirst ? "lg:order-2" : "lg:order-1",
                        )}
                      >
                        <h3 className="font-heading text-xl font-semibold leading-snug text-foreground sm:text-2xl">
                          {item.title}
                        </h3>
                        <DescriptionParagraphs text={item.description} />
                      </div>

                      <div
                        data-animate-card-image
                        className={cn(
                          "relative order-2 aspect-square w-full min-w-0 max-w-full overflow-hidden rounded-2xl md:will-change-transform",
                          imageFirst ? "lg:order-1" : "lg:order-2",
                        )}
                      >
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="pointer-events-none object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      </div>
                    </article>
                  );
                }

                const Icon = whoIsItForIcons[index] ?? Handshake;
                const pasStyles = resolvePasBadgeStyles(item.badge);
                const isLastOdd =
                  whoIsItFor.items.length % 2 === 1 && index === whoIsItFor.items.length - 1;

                return (
                  <article
                    key={item.title}
                    data-animate-card
                    className={cn(
                      "group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(15,23,42,0.05)] ring-1 ring-border/50 transition-all duration-300",
                      LANDING_REVEAL_CLASS,
                      "hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                      pasStyles ? "hover:ring-border/80" : "hover:ring-[#A8E6CF]/60",
                      "md:p-8",
                      isLastOdd && "md:col-span-2 md:mx-auto md:max-w-xl",
                    )}
                  >
                    <div
                      aria-hidden
                      className={cn(
                        "absolute inset-x-0 top-0 h-1 bg-linear-to-r",
                        pasStyles?.accent ??
                          "from-[#A8E6CF] via-[#A8E6CF]/80 to-primary/30",
                      )}
                    />

                    <span
                      className={cn(
                        "inline-flex size-12 items-center justify-center rounded-2xl ring-1 transition-colors",
                        pasStyles?.icon ??
                          "bg-[#A8E6CF]/25 text-[#2D5C4A] ring-[#A8E6CF]/35 group-hover:bg-[#A8E6CF]/35",
                      )}
                    >
                      <Icon className="size-5" strokeWidth={2.25} aria-hidden />
                    </span>

                    <h3 className="mt-5 font-heading text-lg font-bold leading-snug text-foreground md:text-xl">
                      {item.title}
                    </h3>
                    <DescriptionParagraphs text={item.description} className="mt-3 flex-1" />
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
