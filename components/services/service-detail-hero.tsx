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
    <section ref={sectionRef} className="relative isolate flex flex-1 flex-col justify-center py-8 md:py-10">
      <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container relative z-10 mx-auto flex flex-1 flex-col justify-center px-4">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center text-center">
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
          <div
            ref={descRef}
            className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground opacity-0 sm:max-w-3xl sm:text-xl"
          >
            {description}
          </div>
          {socialProof ? (
            <p className="mt-4 max-w-2xl text-sm font-medium text-primary/90 sm:text-base">
              {socialProof}
            </p>
          ) : null}
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
