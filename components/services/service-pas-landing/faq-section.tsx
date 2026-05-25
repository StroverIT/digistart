import { Faq, type FaqItem } from "@/components/ui/faq";
import {
  ServiceSectionBuyCta,
  type ServiceSectionBuyCtaConfig,
} from "@/components/services/service-section-buy-cta";
import { PasSectionIntro } from "./section-intro";

interface PasFaqSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  items: readonly FaqItem[];
  headingFontClass?: string;
  buyCta?: ServiceSectionBuyCtaConfig;
}

export function PasFaqSection({
  eyebrow,
  title,
  description,
  items,
  headingFontClass,
  buyCta,
}: PasFaqSectionProps) {
  return (
    <section id="faq" data-animate-section className="py-8 md:py-20 bg-card/40">
      <div className="container mx-auto px-4">
        <PasSectionIntro
          eyebrow={eyebrow}
          title={title}
          description={description}
          headingFontClass={headingFontClass}
          titleClassName="mb-3"
        />
        <div
          data-animate-card
          className="mx-auto max-w-4xl rounded-2xl border border-border bg-card px-5 py-2 sm:px-8 sm:py-4 opacity-0 translate-y-10 shadow-sm"
        >
          <Faq items={[...items]} />
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
