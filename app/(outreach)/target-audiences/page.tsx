import type { Metadata } from "next";
import Image from "next/image";
import { TargetAudiencesForm } from "@/components/outreach/target-audiences-form";
import { targetAudiencesContent } from "@/lib/data/target-audiences-content";
import {
  SITE_LOGO_HEIGHT,
  SITE_LOGO_SIZES,
  SITE_LOGO_SRC,
  SITE_LOGO_WIDTH,
} from "@/lib/site-brand";

export const metadata: Metadata = {
  title: "3 безплатни целеви аудитории | DigiStart",
  description:
    "Вземи персонализиран анализ с 3 потенциални целеви аудитории за твоя бизнес.",
};

export default function TargetAudiencesPage() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-card p-6 shadow-[var(--shadow-glow)] ring-1 ring-foreground/[0.04] md:p-10 lg:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{ background: "var(--gradient-soft)" }}
          />

          <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
            <div className="flex flex-col">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-card shadow-md ring-1 ring-border/60">
                <Image
                  src={SITE_LOGO_SRC}
                  alt="DigiStart logo"
                  width={SITE_LOGO_WIDTH}
                  height={SITE_LOGO_HEIGHT}
                  sizes={SITE_LOGO_SIZES}
                  className="h-9 w-auto"
                />
              </div>
              <span className="mt-5 inline-flex w-fit rounded-full bg-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {targetAudiencesContent.formPage.badge}
              </span>
              <h1 className="mt-6 font-heading text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl">
                {targetAudiencesContent.formPage.title}
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground md:text-xl">
                {targetAudiencesContent.formPage.description}
              </p>
              <p className="mt-10 max-w-md text-lg leading-relaxed text-muted-foreground">
                {targetAudiencesContent.formPage.disclaimer}
              </p>
            </div>

            <div className="@container rounded-3xl bg-card/90 p-6 ring-1 ring-foreground/[0.05] md:p-8">
              <TargetAudiencesForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
