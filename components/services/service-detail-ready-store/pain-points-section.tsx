import { CircleX } from "lucide-react";
import {
  ServiceSectionBuyCta,
  type ServiceSectionBuyCtaConfig,
} from "@/components/services/service-section-buy-cta";
import { PAIN_POINTS } from "./constants";
import { ReadyStoreSectionIntro } from "./section-intro";

interface ReadyStorePainPointsSectionProps {
  headingFontClass?: string;
  buyCta?: ServiceSectionBuyCtaConfig;
}

export function ReadyStorePainPointsSection({
  headingFontClass,
  buyCta,
}: ReadyStorePainPointsSectionProps) {
  return (
    <section data-animate-section className="py-8 md:py-20 bg-card/50">
      <div className="container mx-auto px-4">
        <ReadyStoreSectionIntro
          eyebrow="Защо губиш време и продажби"
          title="Идеята ти е супер, но хаосът със съобщенията и техническите бариери те спират"
          headingFontClass={headingFontClass}
          titleClassName="mb-3"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {PAIN_POINTS.map((item) => (
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
