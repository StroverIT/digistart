import { Boxes, Package, TrendingUp } from "lucide-react";

export function CaseStudy() {
  return (
    <section id="results" className="container mx-auto px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
          Доказани резултати
        </span>
        <h2 className="mt-5 font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          Успешният пример: Restyled
        </h2>
        <p className="mt-4 text-base text-muted-foreground md:text-lg">
          От хаос в чата до автоматизирана машина за поръчки.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-stretch">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-3xl border border-destructive/20 bg-card p-7">
            <div className="text-xs font-bold uppercase tracking-widest text-destructive">
              Преди
            </div>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>• Хаос в чата, ръчна комуникация за всеки размер и адрес.</li>
              <li>• Трудно управление на 500+ продукта.</li>
              <li>• Собственикът – единствено тясно гърло на бизнеса.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-primary/30 bg-primary/10 p-7">
            <div className="text-xs font-bold uppercase tracking-widest text-primary">
              След DigiStart
            </div>
            <ul className="mt-4 space-y-3 text-sm text-foreground">
              <li>• ~90 автоматизирани поръчки на месец.</li>
              <li>• Каталог с 10 000+ продукта.</li>
              <li>• Остава само качване на нови артикули и пакетиране.</li>
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/30 via-background to-chart-6/20 p-6 md:p-8">
            <div className="flex h-full flex-col justify-between rounded-xl border border-border/60 bg-background/80 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <div className="h-2.5 w-2.5 rounded-full bg-chart-6/60" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  restyled · dashboard
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Package, label: "Поръчки / мес.", value: "90+" },
                  { icon: Boxes, label: "Продукти", value: "10 000+" },
                  { icon: TrendingUp, label: "Ръст", value: "+340%" },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg border border-border/60 bg-card p-3">
                    <m.icon className="h-4 w-4 text-primary" />
                    <div className="mt-2 font-heading text-lg font-bold text-primary">
                      {m.value}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{m.label}</div>
                  </div>
                ))}
              </div>

              <div className="text-[10px] italic text-muted-foreground">
                * Визуализацията е placeholder за реален screenshot от платформата.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
