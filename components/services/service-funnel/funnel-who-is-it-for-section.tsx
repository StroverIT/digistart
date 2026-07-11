"use client";

import { useMemo, useRef, type ReactNode } from "react";
import Image from "next/image";
import { Clock, Handshake, Puzzle, ShieldCheck, Store, type LucideIcon } from "lucide-react";
import {
  LANDING_CARD_CLASS,
  LANDING_REVEAL_CLASS,
} from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useCreativesAnimations } from "@/components/services/service-detail-ads-v2/use-creatives-animations";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import type { ServiceFunnelWhoIsItFor } from "@/config/service-funnels/types";
import { useCompetitorPlatformSelection } from "@/components/services/funnel/use-competitor-platform-selection";
import {
  ServiceSectionBuyCta,
  type ServiceSectionBuyCtaConfig,
} from "@/components/services/service-section-buy-cta";
import { resolveCompetitorPlatformWhoIsItFor } from "@/lib/funnel/competitor-platform-pas";
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

function resolveWhoIsItForIcons(serviceId?: string): LucideIcon[] {
  if (serviceId === "ready-store") {
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

type FunnelWhoIsItForEndCta = ServiceSectionBuyCtaConfig & {
  title: string;
};

type FunnelWhoIsItForSectionProps = {
  whoIsItFor: ServiceFunnelWhoIsItFor;
  serviceId?: string;
  sectionId?: string;
  footer?: ReactNode;
  className?: string;
  gridClassName?: string;
  footerSpacingClassName?: string;
  funnelId?: string;
  endCta?: FunnelWhoIsItForEndCta;
  compactPasImages?: boolean;
};

export function FunnelWhoIsItForSection({
  whoIsItFor,
  serviceId = "ready-store",
  sectionId = "who-is-it-for",
  footer,
  className,
  gridClassName,
  footerSpacingClassName,
  funnelId,
  endCta,
  compactPasImages = false,
}: FunnelWhoIsItForSectionProps) {
  const { answer } = useCompetitorPlatformSelection(funnelId);
  const resolvedWhoIsItFor = useMemo(
    () =>
      funnelId
        ? resolveCompetitorPlatformWhoIsItFor(whoIsItFor, answer)
        : whoIsItFor,
    [answer, funnelId, whoIsItFor],
  );

  const title = resolvedWhoIsItFor.title;
  const subtitle = resolvedWhoIsItFor.subtitle;
  const whoIsItForIcons = resolveWhoIsItForIcons(serviceId);
  const hasPasImages = resolvedWhoIsItFor.items.some((item) => item.image);
  const sectionRef = useRef<HTMLElement>(null);

  useSectionScrollAnimations(sectionRef, {
    staggerReveal: 0.1,
    staggerCard: 0.12,
    skipCards: hasPasImages,
    cardsOnViewIndividually: !hasPasImages,
    itemStart: "top 85%",
  });
  useCreativesAnimations(sectionRef, {
    disableHorizontalOffset: hasPasImages,
    enabled: hasPasImages,
  });

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      aria-labelledby={`${sectionId}-heading`}
      className={cn(
        "scroll-mt-28 overflow-hidden pt-10 md:pt-12",
        footer ? "pb-0" : compactPasImages ? "pb-12 md:pb-16 lg:pb-20" : "pb-10 md:pb-12",
        className ?? "bg-[var(--funnel-lavender)]",
      )}
    >
      <div className="container mx-auto min-w-0 px-4 md:px-8">
        <div
          className={cn(
            "mx-auto min-w-0",
            hasPasImages ? "max-w-6xl" : "max-w-5xl",
          )}
        >
          <header data-animate-reveal className={cn("mx-auto max-w-2xl text-center", LANDING_REVEAL_CLASS)}>
            {title || subtitle ? (
              <>
                <h2
                  id={`${sectionId}-heading`}
                  className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance text-foreground md:text-4xl"
                >
                  {title}
                </h2>
                {subtitle ? (
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground md:mt-5 md:text-lg">
                    {subtitle}
                  </p>
                ) : null}
              </>
            ) : null}
          </header>

          <div
            data-animate-grid
            className={cn(
              "min-w-0",
              hasPasImages
                ? cn(
                  title || subtitle ? "mt-10 md:mt-12" : compactPasImages ? "mt-2 md:mt-4" : "mt-10 md:mt-12",
                  compactPasImages
                    ? "mx-auto flex w-full max-w-4xl flex-col gap-12 lg:max-w-5xl lg:gap-16 xl:gap-20"
                    : "flex flex-col gap-14 lg:gap-20",
                )
                : "mt-10 grid gap-5 sm:gap-6 md:mt-12 md:grid-cols-2 md:gap-8 lg:gap-10",
              gridClassName,
              footerSpacingClassName,
            )}
          >
            {resolvedWhoIsItFor.items.map((item, index) => {
              const itemTitle = item.title;
              const itemDescription = item.description;

              if (item.image) {
                const imageFirst = item.imageFirst ?? false;
                const copyOnLeft = compactPasImages ? imageFirst : !imageFirst;
                const imageOnLeft = compactPasImages ? !imageFirst : imageFirst;

                return (
                  <article
                    key={`${item.badge ?? "item"}-${index}`}
                    data-animate-card
                    className={cn(
                      "group grid min-w-0 items-start gap-6 overflow-hidden sm:gap-8",
                      compactPasImages
                        ? "lg:grid-cols-2 lg:items-center lg:gap-10 xl:gap-12"
                        : "items-center lg:grid-cols-2 lg:gap-16",
                      LANDING_CARD_CLASS,
                    )}
                  >
                    <div
                      data-animate-card-copy
                      className={cn(
                        "order-1 min-w-0 opacity-0",
                        compactPasImages ? "space-y-4 lg:space-y-5" : "space-y-3 lg:py-4",
                        compactPasImages
                          ? copyOnLeft
                            ? "lg:order-1 lg:text-right"
                            : "lg:order-2 lg:text-left"
                          : imageFirst
                            ? "lg:order-2"
                            : "lg:order-1",
                      )}
                    >
                      <h3 className="font-heading text-xl font-semibold leading-snug text-foreground sm:text-2xl">
                        {itemTitle}
                      </h3>
                      <DescriptionParagraphs text={itemDescription} />
                    </div>

                    <div
                      data-animate-card-image
                      className={cn(
                        "relative order-2 aspect-square w-full min-w-0 overflow-hidden rounded-2xl md:will-change-transform",
                        compactPasImages
                          ? cn(
                            "mx-auto w-full max-w-[19rem] sm:max-w-[21rem] lg:mx-0 lg:w-full lg:max-w-[18rem] xl:max-w-[21rem]",
                            imageOnLeft
                              ? "lg:order-1 lg:justify-self-end"
                              : "lg:order-2 lg:justify-self-start",
                          )
                          : cn(
                            "max-w-full",
                            imageFirst ? "lg:order-1" : "lg:order-2",
                          ),
                      )}
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="pointer-events-none object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                        sizes={
                          compactPasImages
                            ? "(max-width: 1024px) 80vw, 384px"
                            : "(max-width: 1024px) 100vw, 50vw"
                        }
                      />
                    </div>
                  </article>
                );
              }

              const Icon = whoIsItForIcons[index] ?? Handshake;
              const pasStyles = resolvePasBadgeStyles(item.badge);
              const isLastOdd =
                resolvedWhoIsItFor.items.length % 2 === 1 &&
                index === resolvedWhoIsItFor.items.length - 1;

              return (
                <article
                  key={`${item.badge ?? "item"}-${index}`}
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
                    {itemTitle}
                  </h3>
                  <DescriptionParagraphs text={itemDescription} className="mt-3 flex-1" />
                </article>
              );
            })}
          </div>

          {endCta ? (
            <div
              data-animate-in-view
              className={cn(
                "mx-auto mt-12 max-w-2xl text-center md:mt-16",
                LANDING_REVEAL_CLASS,
              )}
            >
              <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {endCta.title}
              </h3>
              <ServiceSectionBuyCta
                className="mt-6"
                pagePath={endCta.pagePath}
                ctaId={endCta.ctaId}
                label={endCta.label}
              />
            </div>
          ) : null}
        </div>
      </div>
      {footer}
    </section>
  );
}
