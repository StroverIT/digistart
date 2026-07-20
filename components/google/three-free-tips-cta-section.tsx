"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, Gift } from "lucide-react";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import { googleFreeAnalysisContent } from "@/lib/data/google-free-analysis-content";
import { cn } from "@/lib/utils";

export function ThreeFreeTipsCtaSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useSectionScrollAnimations(sectionRef, {
    staggerReveal: 0.12,
    start: "top 85%",
  });

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-8 md:py-12">
      <div className="relative overflow-hidden rounded-4xl bg-foreground px-6 py-12 text-center text-background md:rounded-[2.5rem] md:px-12 md:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative">
          <span
            data-animate-reveal
            className={cn(
              "inline-flex items-center gap-2 rounded-full bg-background/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary",
              LANDING_REVEAL_CLASS,
            )}
          >
            <Gift className="h-3.5 w-3.5" strokeWidth={2.4} />
            {googleFreeAnalysisContent.tipsCta.badge}
          </span>

          <h2
            data-animate-reveal
            className={cn(
              "mt-5 font-heading text-3xl font-bold tracking-tight md:text-5xl",
              LANDING_REVEAL_CLASS,
            )}
          >
            {googleFreeAnalysisContent.tipsCta.title}
          </h2>

          <p
            data-animate-reveal
            className={cn(
              "mx-auto mt-4 max-w-2xl text-base leading-relaxed text-background/75 md:text-lg",
              LANDING_REVEAL_CLASS,
            )}
          >
            {googleFreeAnalysisContent.tipsCta.description}
          </p>

          <Link
            data-animate-reveal
            href="/google/free-analysis"
            className={cn(
              "group mt-8 inline-flex h-14 items-center gap-3 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-(--shadow-glow) transition-transform hover:scale-[1.03]",
              LANDING_REVEAL_CLASS,
            )}
          >
            {googleFreeAnalysisContent.tipsCta.cta}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
