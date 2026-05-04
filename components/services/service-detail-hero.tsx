"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ServiceDetailHeroProps {
  badgeIcon: ReactNode;
  badgeText: string;
  title: ReactNode;
  description: ReactNode;
  priceSlot: ReactNode;
  primaryLabel: string;
  onPrimaryClick: () => void;
  backHref?: string;
  backCtaId: string;
  headingFontClass?: string;
}

export function ServiceDetailHero({
  badgeIcon,
  badgeText,
  title,
  description,
  priceSlot,
  primaryLabel,
  onPrimaryClick,
  backHref = "/#services",
  backCtaId,
  headingFontClass,
}: ServiceDetailHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const backWrapRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      gsap.set(
        [backWrapRef.current, badgeRef.current, titleRef.current, descRef.current, rowRef.current],
        { opacity: 0, y: 40 },
      );

      const tl = gsap.timeline({ defaults: { ease: "back.out(1.6)" } });
      tl.to(backWrapRef.current, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0)
        .to(badgeRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.05)
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.6 }, "-=0.25")
        .to(descRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25")
        .to(rowRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden pt-8 pb-10 md:pt-14 md:pb-18">
      <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container relative z-10 mx-auto px-4">
        <div ref={backWrapRef} className="mb-6 md:mb-8 opacity-0 translate-y-10">
          <TrackedCtaLink
            href={backHref}
            ctaId={backCtaId}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Към услугите
          </TrackedCtaLink>
        </div>

        <div className="max-w-4xl">
          <span
            ref={badgeRef}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary opacity-0 translate-y-10"
          >
            {badgeIcon}
            {badgeText}
          </span>
          <h1
            ref={titleRef}
            className={cn(
              headingFontClass,
              "mt-6 text-4xl sm:text-5xl leading-tight text-balance opacity-0 translate-y-10",
            )}
          >
            {title}
          </h1>
          <p
            ref={descRef}
            className="mt-5 max-w-3xl text-lg sm:text-xl text-muted-foreground leading-relaxed opacity-0 translate-y-10"
          >
            {description}
          </p>
          <div
            ref={rowRef}
            className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 opacity-0 translate-y-10"
          >
            {priceSlot}
            <Button
              onClick={onPrimaryClick}
              size="lg"
              className="h-14 px-8 text-lg bg-orange-500 hover:bg-orange-600 text-white"
            >
              {primaryLabel}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
