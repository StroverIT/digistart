import { Faq } from "@/components/ui/faq";
import { FAQ_ITEMS } from "./constants";
import { ReadyStoreSectionIntro } from "./section-intro";

interface ReadyStoreFaqSectionProps {
  headingFontClass?: string;
}

export function ReadyStoreFaqSection({ headingFontClass }: ReadyStoreFaqSectionProps) {
  return (
    <section data-animate-section className="py-8 md:py-20 bg-card/40">
      <div className="container mx-auto px-4">
        <ReadyStoreSectionIntro
          eyebrow="FAQ"
          title="Често задавани въпроси"
          description="Всичко важно, което най-често ни питат преди старт на онлайн магазин."
          headingFontClass={headingFontClass}
          titleClassName="mb-3"
        />
        <div
          data-animate-card
          className="mx-auto max-w-4xl rounded-2xl border border-border bg-card px-5 py-2 sm:px-8 sm:py-4 opacity-0 translate-y-10"
        >
          <Faq items={FAQ_ITEMS} />
        </div>
      </div>
    </section>
  );
}
