import { CheckCircle2 } from "lucide-react";
import {
  ServiceSectionBuyCta,
  type ServiceSectionBuyCtaConfig,
} from "@/components/services/service-section-buy-cta";
import { PasSectionIntro } from "./section-intro";

interface PasSolutionSectionProps {
  eyebrow: string;
  title: string;
  items: readonly string[];
  headingFontClass?: string;
  buyCta?: ServiceSectionBuyCtaConfig;
}

export function PasSolutionSection({
  eyebrow,
  title,
  items,
  headingFontClass,
  buyCta,
}: PasSolutionSectionProps) {
  return (
    <section data-animate-section className="py-8 md:py-20">
      <div className="container mx-auto px-4">
        <PasSectionIntro
          eyebrow={eyebrow}
          title={title}
          headingFontClass={headingFontClass}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item}
              data-animate-card
              className="group border border-border bg-card hover:border-green-500/40 transition-all duration-300 rounded-xl opacity-0 translate-y-10 hover:shadow-sm"
            >
              <div className="p-5 md:p-6 flex items-start gap-3">
                <div className="shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/20 group-hover:bg-green-500/15 transition-colors">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-muted-foreground leading-relaxed">{item}</p>
              </div>
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
