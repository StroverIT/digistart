import { CheckCircle2 } from "lucide-react";
import { SOLUTION_ITEMS } from "./constants";
import { ReadyStoreSectionIntro } from "./section-intro";

interface ReadyStoreSolutionSectionProps {
  headingFontClass?: string;
}

export function ReadyStoreSolutionSection({
  headingFontClass,
}: ReadyStoreSolutionSectionProps) {
  return (
    <section data-animate-section className="py-8 md:py-20">
      <div className="container mx-auto px-4">
        <ReadyStoreSectionIntro
          eyebrow="Автоматизиран бизнес, не просто сайт"
          title="Какво получаваш, когато оставиш техническата част на нас?"
          headingFontClass={headingFontClass}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {SOLUTION_ITEMS.map((item) => (
            <div
              key={item}
              data-animate-card
              className="group border border-border bg-card hover:border-primary/50 transition-all duration-300 rounded-xl opacity-0 translate-y-10"
            >
              <div className="p-5 md:p-6 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-muted-foreground leading-relaxed">{item}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
