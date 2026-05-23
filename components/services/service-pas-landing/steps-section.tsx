import { ClipboardList } from "lucide-react";
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
        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-border to-transparent -translate-y-1/2" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((step, index) => (
              <div key={step.title} className="relative">
                <div
                  data-animate-card
                  className="group bg-card border border-border hover:border-primary/50 transition-colors h-full rounded-xl opacity-0 translate-y-10"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <step.icon className="h-5 w-5" />
                      </div>
                      <span className="text-3xl font-bold text-muted-foreground/30">
                        0{index + 1}
                      </span>
                      <ClipboardList className="ml-auto h-5 w-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                  </div>
                </div>
                {index < items.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <div className="h-8 w-0.5 bg-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
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
