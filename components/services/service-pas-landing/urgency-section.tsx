import { AlertTriangle } from "lucide-react";
import {
  ServiceSectionBuyCta,
  type ServiceSectionBuyCtaConfig,
} from "@/components/services/service-section-buy-cta";
import { PasSectionIntro } from "./section-intro";

interface PasUrgencySectionProps {
  eyebrow: string;
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
  headingFontClass?: string;
  buyCta?: ServiceSectionBuyCtaConfig;
}

export function PasUrgencySection({
  eyebrow,
  title,
  paragraphs,
  bullets,
  headingFontClass,
  buyCta,
}: PasUrgencySectionProps) {
  return (
    <section data-animate-section className="py-8 md:py-20 bg-destructive/5">
      <div className="container mx-auto px-4">
        <PasSectionIntro
          eyebrow={eyebrow}
          title={title}
          headingFontClass={headingFontClass}
        />
        <div
          data-animate-card
          className="relative mx-auto max-w-3xl rounded-2xl border border-destructive/25 bg-card/90 p-6 md:p-8 shadow-sm overflow-hidden opacity-0 translate-y-10"
        >
          <div className="absolute inset-y-0 left-0 w-1 bg-destructive/60 rounded-l-2xl" />
          <div className="flex items-start gap-4 mb-4">
            <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="space-y-4">
              {paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-muted-foreground leading-relaxed text-base sm:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          {bullets && bullets.length > 0 ? (
            <ul className="mt-2 space-y-2.5 border-t border-border/60 pt-4 pl-14" role="list">
              {bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-2.5 text-sm sm:text-base text-foreground"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/70" />
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {buyCta ? (
          <div data-animate-reveal className="mt-8 md:mt-10 opacity-0 translate-y-10">
            <ServiceSectionBuyCta {...buyCta} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
