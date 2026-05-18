import {
  ServiceSectionBuyCta,
  type ServiceSectionBuyCtaConfig,
} from "@/components/services/service-section-buy-cta";
import {
  HERO_DESCRIPTION_DETAIL_P1,
  HERO_DESCRIPTION_DETAIL_P2,
  HERO_DETAIL_HIGHLIGHTS,
} from "./constants";

interface ReadyStoreValuePropSectionProps {
  buyCta?: ServiceSectionBuyCtaConfig;
}

export function ReadyStoreValuePropSection({ buyCta }: ReadyStoreValuePropSectionProps) {
  return (
    <section data-animate-section className="relative overflow-hidden py-12 md:py-20">
      <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-background to-primary/5" />
      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <p
            data-animate-reveal
            className="text-base sm:text-lg text-foreground leading-relaxed opacity-0 translate-y-10"
          >
            {HERO_DESCRIPTION_DETAIL_P1}
          </p>
          <p
            data-animate-reveal
            className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed opacity-0 translate-y-10"
          >
            {HERO_DESCRIPTION_DETAIL_P2}
          </p>
          <div
            data-animate-reveal
            className="mt-4 flex flex-wrap justify-center gap-2 pt-1 opacity-0 translate-y-10"
          >
            {HERO_DETAIL_HIGHLIGHTS.map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        {buyCta ? (
          <div
            data-animate-reveal
            className="mt-8 md:mt-10 opacity-0 translate-y-10"
          >
            <ServiceSectionBuyCta {...buyCta} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
