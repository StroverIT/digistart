"use client";

import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
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
  return (
    <section className="relative overflow-hidden pt-8 pb-10 md:pt-14 md:pb-18">
      <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl animate-pulse delay-1000" />
      </div>
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container relative z-10 mx-auto px-4">
        <TrackedCtaLink
          href={backHref}
          ctaId={backCtaId}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 md:mb-8"
        >
          Към услугите
        </TrackedCtaLink>

        <div className="max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            {badgeIcon}
            {badgeText}
          </span>
          <h1 className={cn(headingFontClass, "mt-6 text-4xl sm:text-5xl leading-tight text-balance")}>
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
            {description}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
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
