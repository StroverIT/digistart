import {
  ServiceSectionBuyCta,
  type ServiceSectionBuyCtaConfig,
} from "@/components/services/service-section-buy-cta";
import type { ServicePasAuthorityStat } from "./types";
import { PasSectionIntro } from "./section-intro";

interface PasAuthoritySectionProps {
  eyebrow: string;
  title: string;
  stats: readonly ServicePasAuthorityStat[];
  headingFontClass?: string;
  buyCta?: ServiceSectionBuyCtaConfig;
}

export function PasAuthoritySection({
  eyebrow,
  title,
  stats,
  headingFontClass,
  buyCta,
}: PasAuthoritySectionProps) {
  return (
    <section data-animate-section className="py-8 md:py-20 bg-card/40 border-y border-border/70">
      <div className="container mx-auto px-4">
        <PasSectionIntro
          eyebrow={eyebrow}
          title={title}
          headingFontClass={headingFontClass}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              data-animate-card
              className="rounded-xl border border-primary/20 bg-linear-to-b from-primary/10 to-primary/5 px-5 py-7 text-center opacity-0 translate-y-10 transition-all duration-300 hover:border-primary/35 hover:shadow-sm"
            >
              <p className="text-3xl sm:text-4xl font-bold text-primary leading-none">{stat.value}</p>
              <div className="mx-auto my-3 h-px w-8 bg-primary/30" />
              <p className="text-sm text-muted-foreground leading-snug">{stat.label}</p>
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
