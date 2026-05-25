import type { ReactNode } from "react";
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
  intro?: ReactNode;
  items: readonly ServicePasPainPoint[];
  headingFontClass?: string;
  buyCta?: ServiceSectionBuyCtaConfig;
}

export function PasProblemSection({
  eyebrow,
  title,
  intro,
  items,
  headingFontClass,
  buyCta,
}: PasProblemSectionProps) {
  return (
    <section id="for-you" data-animate-section className="py-8 md:py-20 bg-card/50">
      <div className="container mx-auto px-4">
        <PasSectionIntro
          eyebrow={eyebrow}
          title={title}
          headingFontClass={headingFontClass}
        />
        {intro ? (
          <div className="mx-auto mb-8 max-w-3xl space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {intro}
          </div>
        ) : null}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              data-animate-card
              className="group relative bg-card border border-border hover:border-destructive/40 rounded-xl transition-all duration-300 opacity-0 translate-y-10 hover:shadow-md overflow-hidden"
            >
              <div className="absolute inset-y-0 left-0 w-0.5 bg-destructive/0 group-hover:bg-destructive/50 transition-colors duration-300 rounded-l-xl" />
              <div className="p-6 md:p-7">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 ring-1 ring-destructive/15 group-hover:bg-destructive/15 transition-colors">
                  <CircleX className="h-5 w-5 text-destructive" />
                </div>
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
