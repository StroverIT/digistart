import { CircleX } from "lucide-react";
import {
  ServiceSectionBuyCta,
  type ServiceSectionBuyCtaConfig,
} from "@/components/services/service-section-buy-cta";
import type { ServicePasPainPoint } from "./types";
import { PasSectionIntro } from "./section-intro";

interface PasProblemSectionProps {
  eyebrow: string;
  title: string;
  items: readonly ServicePasPainPoint[];
  headingFontClass?: string;
  buyCta?: ServiceSectionBuyCtaConfig;
}

export function PasProblemSection({
  eyebrow,
  title,
  items,
  headingFontClass,
  buyCta,
}: PasProblemSectionProps) {
  return (
    <section data-animate-section className="py-8 md:py-20 bg-card/50">
      <div className="container mx-auto px-4">
        <PasSectionIntro
          eyebrow={eyebrow}
          title={title}
          headingFontClass={headingFontClass}
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              data-animate-card
              className="group bg-card border border-border hover:border-destructive/50 rounded-xl transition-all duration-300 opacity-0 translate-y-10"
            >
              <div className="p-6 md:p-7">
                <CircleX className="h-5 w-5 text-red-500 mb-4" />
                <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
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
