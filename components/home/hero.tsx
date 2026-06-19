import { ArrowRight } from "lucide-react";
import { EcosystemVisual } from "@/components/home/ecosystem-visual";

export function HomeHero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "var(--gradient-soft)" }}
      />
      <div className="container mx-auto grid gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-2 lg:items-center">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Дигитална екосистема за бизнес
          </span>
          <h1 className="mt-6 font-heading text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Ние не продаваме услуги.
            <span className="block">
              Ние създаваме твоето{" "}
              <span className="relative inline-block">
                <span className="relative z-10 gradient-text">бъдеще.</span>
                <span className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-primary/20" />
              </span>
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Разполагаме с всички необходими инструменти и експертиза, за да накараме
            бизнеса ти да процъфти – от онлайн магазин до печеливши реклами и
            съдържание, което продава. Ние вършим черната работа. Ти растеш.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#booking"
              className="group inline-flex h-14 items-center gap-3 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
            >
              Запиши безплатна консултация
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#paths"
              className="inline-flex h-14 items-center rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Как работим
            </a>
          </div>
        </div>

        <div className="animate-in fade-in zoom-in-95 duration-1000">
          <EcosystemVisual />
        </div>
      </div>
    </section>
  );
}
