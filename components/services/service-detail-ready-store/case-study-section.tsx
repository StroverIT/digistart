import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Facebook, Instagram } from "lucide-react";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { cn } from "@/lib/utils";
import { RESTYLED_CASE } from "./constants";
import { ReadyStoreSectionIntro } from "./section-intro";

interface ReadyStoreCaseStudySectionProps {
  headingFontClass?: string;
}

export function ReadyStoreCaseStudySection({
  headingFontClass,
}: ReadyStoreCaseStudySectionProps) {
  return (
    <section data-animate-section className="py-8 md:py-20 border-y border-border/70 bg-card/30">
      <div className="container mx-auto px-4">
        <ReadyStoreSectionIntro
          eyebrow="Казус"
          title="От хаос в съобщенията до подреден бизнес: Историята на Restyled"
          headingFontClass={headingFontClass}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          <div
            data-animate-card
            className="relative w-full aspect-4/3 overflow-hidden rounded-lg opacity-0 translate-y-10"
          >
            <Image
              src="/what-we-offer/restyled-mock-up.png"
              alt="Restyled case study"
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="space-y-6 sm:space-y-8">
            <div data-animate-reveal className="opacity-0 translate-y-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 block">
                Онлайн магазин · Fashion
              </span>
              <h3 className={cn(headingFontClass, "text-2xl sm:text-3xl md:text-4xl mb-4 text-balance")}>
                Restyled
              </h3>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-4">
                {RESTYLED_CASE.story}
              </p>
              <p className="text-foreground text-base sm:text-lg leading-relaxed font-medium">
                {RESTYLED_CASE.result}
              </p>
            </div>

            <div
              data-animate-reveal
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 opacity-0 translate-y-10"
            >
              <TrackedCtaLink
                href={RESTYLED_CASE.website}
                ctaId="service_ready_store_restyled_store"
                className="inline-flex items-center gap-2 text-primary text-base sm:text-lg font-medium group"
                _blank={true}
              >
                Виж онлайн магазина
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </TrackedCtaLink>
              <div className="flex items-center gap-3">
                <Link
                  href={RESTYLED_CASE.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                  aria-label="Restyled във Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </Link>
                <Link
                  href={RESTYLED_CASE.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                  aria-label="Restyled в Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
