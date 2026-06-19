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

type ProcessStepsContentProps = {
  variant?: "section" | "embedded";
};

export function ProcessStepsContent({ variant = "section" }: ProcessStepsContentProps) {
  const isEmbedded = variant === "embedded";

  return (
    <div id={isEmbedded ? "process" : undefined}>
      <div className={cn(isEmbedded ? "text-left" : "mx-auto max-w-2xl text-center")}>
        {isEmbedded ? (
          <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Какъв е процеса
          </h3>
        ) : (
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Какъв е процеса
          </h2>
        )}
        <p className={cn("mt-3 text-muted-foreground", isEmbedded ? "text-sm md:text-base" : "md:text-lg")}>
          Три ясни стъпки – без сложни термини, без скрити такси.
        </p>
      </div>

      <div
        className={cn(
          "relative",
          isEmbedded ? "mt-8" : "mx-auto mt-12 max-w-5xl",
        )}
      >
        {!isEmbedded && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-7 right-[calc(16.666%-1.75rem)] left-[calc(16.666%-1.75rem)] hidden h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 md:block"
          />
        )}

        <ol className={cn("grid gap-0", isEmbedded ? "gap-0" : "md:grid-cols-3 md:gap-6")}>
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const Icon = step.icon;

            return (
              <li
                key={step.title}
                className={cn(
                  "relative",
                  isEmbedded ? "flex items-start gap-4" : "md:flex md:flex-col md:items-center",
                  !isLast && (isEmbedded ? "pb-6" : "pb-10 md:pb-0"),
                )}
              >
                {!isLast && (
                  <div
                    aria-hidden
                    className={cn(
                      "absolute bg-gradient-to-b from-primary via-primary/40 to-primary/20",
                      isEmbedded
                        ? "top-7 bottom-0 left-7 w-px"
                        : "top-7 bottom-0 left-7 w-px md:hidden",
                    )}
                  />
                )}

                <div
                  className={cn(
                    "relative z-10 shrink-0",
                    !isEmbedded && "flex items-start gap-5 md:flex-col md:items-center md:gap-0",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-full bg-primary font-heading font-bold text-primary-foreground shadow-[var(--shadow-glow)] ring-4 ring-card",
                      isEmbedded ? "h-14 w-14 text-lg" : "h-14 w-14 text-xl",
                    )}
                  >
                    {index + 1}
                  </div>
                </div>

                <article
                  className={cn(
                    "relative z-10 min-w-0 flex-1",
                    !isEmbedded &&
                      "rounded-3xl border border-border bg-card p-6 transition-all md:mt-6 md:w-full md:p-7 hover:border-primary/30 hover:shadow-[var(--shadow-soft)]",
                  )}
                >
                  {!isEmbedded && (
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Icon className="h-5 w-5" strokeWidth={2.2} />
                    </div>
                  )}
                  {isEmbedded ? (
                    <h4 className="font-heading text-base font-bold text-foreground md:text-lg">
                      {step.title}
                    </h4>
                  ) : (
                    <h3 className="font-heading text-xl font-bold text-foreground">{step.title}</h3>
                  )}
                  <p
                    className={cn(
                      "mt-1.5 leading-relaxed text-muted-foreground",
                      isEmbedded ? "text-sm" : "mt-2 text-sm",
                    )}
                  >
                    {step.description}
                  </p>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
