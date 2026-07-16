"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import {
  TARGET_AUDIENCES_PAGE_PATH,
  targetAudiencesContent,
} from "@/lib/data/target-audiences-content";
import {
  SITE_LOGO_HEIGHT,
  SITE_LOGO_SIZES,
  SITE_LOGO_SRC,
  SITE_LOGO_WIDTH,
} from "@/lib/site-brand";

export function TargetAudiencesTeaser() {
  return (
    <section id="target-audiences" className="container mx-auto px-4 py-20 md:px-8 md:py-28">
      <div className="relative mt-8 overflow-visible rounded-[2.5rem] bg-card px-6 py-12 text-center shadow-[var(--shadow-glow)] ring-1 ring-foreground/[0.04] md:mt-10 md:px-10 md:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "var(--gradient-soft)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-44 w-44 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
        />

        <div className="mx-auto max-w-2xl">
          <div className="absolute left-1/2 top-0 inline-flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-card shadow-lg ring-1 ring-border/60">
            <Image
              src={SITE_LOGO_SRC}
              alt="DigiStart logo"
              width={SITE_LOGO_WIDTH}
              height={SITE_LOGO_HEIGHT}
              sizes={SITE_LOGO_SIZES}
              className="h-10 w-auto"
            />
          </div>
          <span className="inline-flex rounded-full bg-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {targetAudiencesContent.teaser.badge}
          </span>
          <h2 className="mt-6 font-heading text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            3 Потенциални
            <span className="mt-2 block font-accent italic">целеви аудитории</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-xl">
            {targetAudiencesContent.teaser.description}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {targetAudiencesContent.teaser.helper}
          </p>

          <TrackedCtaLink
            href={TARGET_AUDIENCES_PAGE_PATH}
            ctaId="home_target_audiences_cta"
            className="mt-8 inline-flex"
          >
            <span className="group inline-flex h-14 items-center gap-3 rounded-full bg-foreground px-8 text-lg font-semibold text-background transition-transform hover:scale-[1.02]">
              {targetAudiencesContent.teaser.cta}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </TrackedCtaLink>
        </div>
      </div>
    </section>
  );
}
