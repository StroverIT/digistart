import { Clock, Heart } from "lucide-react";

export function MotivationBlock() {
  return (
    <section className="container mx-auto px-4 py-16 md:px-8 md:py-20">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground px-6 py-14 text-background md:px-16 md:py-20">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              Какво ни мотивира
            </span>
            <h2 className="mt-5 font-heading text-3xl font-bold leading-tight md:text-5xl">
              Край на AI слопа и
              <br />
              chat ботовете.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-background/85 md:text-lg">
              Зад всеки проект в DigiStart стои реален човек, когото го е грижа за
              твоя бизнес. Ние не сме поредната безлична агенция, а реални хора с
              умения.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-primary/30 bg-background/5 p-6 backdrop-blur-sm">
              <Heart className="h-7 w-7 text-primary" strokeWidth={2.2} />
              <div className="mt-3 font-heading text-lg font-bold">Реални хора</div>
              <p className="mt-1 text-sm text-background/80">
                Без шаблонни отговори и автоматизирани боксове, които не разбират
                бизнеса ти.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/30 bg-primary p-6 text-primary-foreground">
              <Clock className="h-7 w-7" strokeWidth={2.2} />
              <div className="mt-3 font-heading text-lg font-bold">
                Поддръжка 9:00 – 22:00
              </div>
              <p className="mt-1 text-sm opacity-80">
                Всеки ден от седмицата. Когато имаш проблем с поръчка, ти трябва
                решение веднага.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
