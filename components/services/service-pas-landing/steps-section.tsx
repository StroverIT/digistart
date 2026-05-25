import {
  ServiceSectionBuyCta,
  type ServiceSectionBuyCtaConfig,
} from "@/components/services/service-section-buy-cta";
import type { ServicePasStep } from "./types";
import { PasSectionIntro } from "./section-intro";

interface PasStepsSectionProps {
  eyebrow: string;
  title: string;
  description?: string;
  items: readonly ServicePasStep[];
  headingFontClass?: string;
  buyCta?: ServiceSectionBuyCtaConfig;
}

export function PasStepsSection({
  eyebrow,
  title,
  description,
  items,
  headingFontClass,
  buyCta,
}: PasStepsSectionProps) {
  return (
    <section data-animate-section className="py-8 md:py-20">
      <div className="container mx-auto px-4">
        <PasSectionIntro
          eyebrow={eyebrow}
          title={title}
          description={description}
          headingFontClass={headingFontClass}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((step, index) => (
            <div
              key={step.title}
              data-animate-card
              className="group relative bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 h-full rounded-xl opacity-0 translate-y-10"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="h-11 w-11 rounded-full bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary transition-all duration-300">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-5xl font-bold text-muted-foreground/15 leading-none select-none tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-semibold text-base mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
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
