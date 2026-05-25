"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { PasHeroCtaSection } from "./service-pas-landing/hero-cta-section";

interface ServiceDetailHeroProps {
  badgeIcon: ReactNode;
  badgeText: string;
  title: ReactNode;
  description: ReactNode;
  /** Optional social proof line below the description (direct-response style). */
  socialProof?: string;
  headingFontClass?: string;
  priceSlot: ReactNode;
  primaryLabel: string;
  onPrimaryClick: () => void;
}

export function ServiceDetailHero({
  badgeIcon,
  badgeText,
  title,
  description,
  socialProof,
  headingFontClass,
  priceSlot,
  primaryLabel,
  onPrimaryClick,
}: ServiceDetailHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      const targets = [badgeRef.current, titleRef.current, descRef.current];
      gsap.set(targets, { opacity: 0, y: 40 });

      const tl = gsap.timeline({ defaults: { ease: "back.out(1.6)" } });
      tl.to(badgeRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0)
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.05)
        .to(descRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25");
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-dvh flex-col justify-center py-16 md:py-20"
    >
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute inset-0 bg-linear-to-br from-background via-secondary/25 to-primary/12" />
        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-primary/10 to-chart-6/12" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,oklch(0.65_0.22_250_/_0.14),transparent_65%)]" />
      </div>

      <div className="container relative z-10 mx-auto flex flex-1 flex-col justify-center">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center text-center gap-6">
          <div>
            <span
              ref={badgeRef}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary opacity-0"
            >
              {badgeIcon}
              {badgeText}
            </span>
            <h1
              ref={titleRef}
              className={cn(
                headingFontClass,
                "mt-6 text-4xl leading-tight text-balance opacity-0 sm:text-5xl lg:text-6xl",
              )}
            >
              {title}
            </h1>
          </div>

          <div
            ref={descRef}
            className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground opacity-0 sm:max-w-3xl sm:text-xl"
          >
            {description}
          </div>
          <PasHeroCtaSection
            priceSlot={priceSlot}
            primaryLabel={primaryLabel}
            onPrimaryClick={onPrimaryClick}
          />
        </div>
      </div>
    </section>
  );
}
