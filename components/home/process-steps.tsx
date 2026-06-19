import { FileCheck, MessageCircle, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: MessageCircle,
    title: "Безплатна консултация",
    description:
      "Разговаряме човешки, за да разберем къде се намира бизнесът ти в момента и накъде искаш да стигне.",
  },
  {
    icon: FileCheck,
    title: "Прозрачна оферта",
    description:
      "Изпращаме ти предложение, в което ясно виждаш кои услуги са ти нужни и как точно ще ти бъдат полезни.",
  },
  {
    icon: Rocket,
    title: "Старт спрямо бюджета",
    description:
      "Избираш конфигурацията, която работи за теб, и я поръчваш директно през сайта.",
  },
];

export function ProcessSteps() {
  return (
    <section id="process" className="container mx-auto px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          Какъв е процеса
        </h2>
        <p className="mt-4 text-muted-foreground md:text-lg">
          Три ясни стъпки – без сложни термини, без скрити такси.
        </p>
      </div>

      <div className="relative mx-auto mt-12 max-w-5xl">
        <div
          aria-hidden
          className="pointer-events-none absolute top-7 right-[calc(16.666%-1.75rem)] left-[calc(16.666%-1.75rem)] hidden h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 md:block"
        />

        <ol className="grid gap-0 md:grid-cols-3 md:gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <li
                key={step.title}
                className={cn(
                  "relative md:flex md:flex-col md:items-center",
                  !isLast && "pb-10 md:pb-0",
                )}
              >
                {!isLast && (
                  <div
                    aria-hidden
                    className="absolute top-7 bottom-0 left-7 w-px bg-gradient-to-b from-primary via-primary/40 to-primary/20 md:hidden"
                  />
                )}

                <div className="relative z-10 flex items-start gap-5 md:flex-col md:items-center md:gap-0">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-xl font-bold text-primary-foreground shadow-[var(--shadow-glow)] ring-4 ring-background">
                    {index + 1}
                  </div>

                  <article
                    className={cn(
                      "min-w-0 flex-1 rounded-3xl border border-border bg-card p-6 transition-all md:mt-6 md:w-full md:p-7",
                      "hover:border-primary/30 hover:shadow-[var(--shadow-soft)]",
                    )}
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Icon className="h-5 w-5" strokeWidth={2.2} />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </article>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
