import type { ReactNode } from "react";
import { EcosystemVisual } from "@/components/home/ecosystem-visual";

const DEFAULT_HEADING = (
  <>
    <span className="block text-balance">Рекламна агенция,</span>
    <span className="mt-2 block md:mt-3">
      <span className="relative inline-block">
        <span className="relative z-10">София</span>
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-[0.08em] -z-0 h-[0.16em] rounded-full bg-primary"
        />
      </span>
    </span>
  </>
);

type HomeHeroProps = {
  heading?: ReactNode;
};

export function HomeHero({ heading = DEFAULT_HEADING }: HomeHeroProps) {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "var(--gradient-soft)" }}
      />
      <div className="container mx-auto grid gap-12 px-4 pt-28 pb-24 md:px-8 md:pt-36 md:pb-32 lg:grid-cols-2 lg:items-center lg:pt-40 lg:pb-36">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="font-heading text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {heading}
          </h1>
          <div className="mt-6 max-w-lg space-y-3 text-pretty">
            <p className="text-lg font-medium leading-snug text-foreground/90 md:text-xl">
              Стратегия и инструменти, които карат бизнеса ти да процъфти.
            </p>
            <p className="text-base font-semibold text-foreground/90">
              Ние вършим техническата работа. Ти продаваш.
            </p>
          </div>
        </div>

        <EcosystemVisual />
      </div>
    </section>
  );
}
