"use client";

import dynamic from "next/dynamic";
import { ArrowRight, BarChart3, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { LandingSection } from "@/components/services/service-detail-ready-store-v2/shared";
import { LANDING_BODY_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import GoogleReviewsSection from "@/components/services/service-detail-ready-store-v2/GoogleReviewsSection";

const HeroVideo = dynamic(() => import("./HeroVideo"), {
  loading: () => (
    <article className="w-full flex-1">
      <div
        className="overflow-hidden rounded-2xl border border-border/80 bg-muted/40 p-2 shadow-xl shadow-primary/5 sm:p-3"
        aria-hidden
      >
        <div className="aspect-video w-full rounded-xl bg-muted/60" />
      </div>
    </article>
  ),
});

const heroFeatures = [
  {
    icon: Search,
    label: "Google Ads",
    hint: "Търсене и Shopping",
  },
  {
    icon: Sparkles,
    label: "Meta Ads",
    hint: "Facebook и Instagram",
  },
  {
    icon: BarChart3,
    label: "Анализи и отчети",
    hint: "Седмични резултати",
  },
] as const;

const HeroSection = () => {
  return (
    <LandingSection
      className="border-b-0 bg-linear-to-b from-white to-primary/50 pt-0 pb-14 md:pb-20 lg:pb-24"
      contentClassName="pt-site-header"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 lg:items-center lg:gap-16">
        <div className="flex w-full flex-col items-center text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Google Ads и Meta реклами
          </p>
          <h1 className="font-heading mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            Търсене. Откриване. Продажби.
          </h1>
          <p className={cn("mt-4 max-w-lg", LANDING_BODY_CLASS)}>
            Meta Ads създават интерес. Google Ads правят директните продажби. Ние управляваме и двете.
          </p>

          <div className="mt-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-[var(--shadow-soft)]">
            <div className="border-b border-primary/10 bg-primary/5 px-4 py-3 sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                Управление на двата канала
              </p>
            </div>

            <ul className="grid divide-y divide-primary/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {heroFeatures.map(({ icon: Icon, label, hint }) => (
                <li
                  key={label}
                  className="flex flex-col items-center gap-2 px-4 py-5 text-center sm:px-3"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-accent ring-1 ring-primary/20">
                    <Icon className="size-5" strokeWidth={2.25} aria-hidden />
                  </span>
                  <span className="font-heading text-sm font-bold leading-snug text-foreground">
                    {label}
                  </span>
                  <span className="max-w-[11rem] text-xs leading-relaxed text-muted-foreground">
                    {hint}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col items-center gap-3 border-t border-primary/10 bg-linear-to-b from-transparent to-primary/5 px-4 py-6 sm:px-6">
              <a
                href="#buy-section"
                className="group inline-flex h-12 w-full max-w-sm items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100 sm:w-auto"
              >
                Стартирай реклами
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>

        <HeroVideo videoId="DDY4Ado5BRA" title="DigiStart Google и Meta реклами" />
      </div>
      <GoogleReviewsSection />
    </LandingSection>
  );
};

export default HeroSection;
