import { Check } from "lucide-react";
import {
  ServiceSectionBuyCta,
  type ServiceSectionBuyCtaConfig,
} from "@/components/services/service-section-buy-cta";
import { PasSectionIntro } from "./section-intro";

interface PasQualificationSectionProps {
  eyebrow: string;
  title: string;
  statements: readonly string[];
  headingFontClass?: string;
  buyCta?: ServiceSectionBuyCtaConfig;
}

export function PasQualificationSection({
  eyebrow,
  title,
  statements,
  headingFontClass,
  buyCta,
}: PasQualificationSectionProps) {
  return (
    <section data-animate-section className="py-8 md:py-20 border-y border-border/70">
      <div className="container mx-auto px-4">
        <PasSectionIntro
          eyebrow={eyebrow}
          title={title}
          headingFontClass={headingFontClass}
        />
        <ul
          className="mx-auto max-w-3xl grid gap-3 sm:grid-cols-2 sm:gap-4"
          role="list"
        >
          {statements.map((statement) => (
            <li
              key={statement}
              data-animate-card
              className="group flex items-start gap-3 rounded-xl border border-border bg-card/80 px-4 py-4 opacity-0 translate-y-10 transition-all duration-200 hover:border-primary/30 hover:bg-card"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors">
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              <span className="text-sm sm:text-base leading-relaxed text-foreground">
                {statement}
              </span>
            </li>
          ))}
        </ul>
        {buyCta ? (
          <div data-animate-reveal className="mt-8 md:mt-10 opacity-0 translate-y-10">
            <ServiceSectionBuyCta {...buyCta} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
