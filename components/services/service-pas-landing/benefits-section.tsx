import { Sparkles } from "lucide-react";
import {
  ServiceSectionBuyCta,
  type ServiceSectionBuyCtaConfig,
} from "@/components/services/service-section-buy-cta";
import type { ServicePasBenefit } from "./types";
import { PasSectionIntro } from "./section-intro";

interface PasBenefitsSectionProps {
  eyebrow: string;
  title: string;
  items: readonly ServicePasBenefit[];
  headingFontClass?: string;
  buyCta?: ServiceSectionBuyCtaConfig;
}

export function PasBenefitsSection({
  eyebrow,
  title,
  items,
  headingFontClass,
  buyCta,
}: PasBenefitsSectionProps) {
  return (
    <section id="benefits" data-animate-section className="py-8 md:py-20">
      <div className="container mx-auto px-4">
        <PasSectionIntro eyebrow={eyebrow} title={title} headingFontClass={headingFontClass} />
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.title}
              data-animate-card
              className="group rounded-xl border border-border bg-card/80 p-6 md:p-7 opacity-0 translate-y-10 transition-all duration-300 hover:border-primary/35 hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 group-hover:bg-primary/15 transition-colors">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <h3 className="mb-3 text-lg font-bold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          ))}
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
