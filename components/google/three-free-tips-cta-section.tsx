"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, Gift } from "lucide-react";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import { googleFreeAnalysisContent } from "@/lib/data/google-free-analysis-content";
import { cn } from "@/lib/utils";

type ThreeFreeTipsCtaSectionProps = {
  /** `tips` = blog CTA → /google/three-free-tips; `analysis` = upsell → free analysis */
  variant?: "tips" | "analysis";
};

export function ThreeFreeTipsCtaSection({
  variant = "tips",
}: ThreeFreeTipsCtaSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const copy =
    variant === "analysis"
      ? googleFreeAnalysisContent.analysisCta
      : googleFreeAnalysisContent.tipsCta;
  const href =
    variant === "analysis" ? "/google/free-analysis" : "/google/three-free-tips";

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
            {copy.badge}
          </span>

          <h2
            data-animate-reveal
            className={cn(
              "mt-5 font-heading text-3xl font-bold tracking-tight md:text-5xl",
              LANDING_REVEAL_CLASS,
            )}
          >
            {copy.title}
          </h2>

          <p
            data-animate-reveal
            className={cn(
              "mx-auto mt-4 max-w-2xl text-base leading-relaxed text-background/75 md:text-lg",
              LANDING_REVEAL_CLASS,
            )}
          >
            {copy.description}
          </p>

          {"note" in copy && copy.note ? (
            <p
              data-animate-reveal
              className={cn(
                "mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-background/60",
                LANDING_REVEAL_CLASS,
              )}
            >
              {copy.note}
            </p>
          ) : null}

          <Link
            data-animate-reveal
            href={href}
            className={cn(
              "group mt-8 inline-flex h-14 items-center gap-3 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-(--shadow-glow) transition-transform hover:scale-[1.03]",
              LANDING_REVEAL_CLASS,
            )}
          >
            {copy.cta}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
