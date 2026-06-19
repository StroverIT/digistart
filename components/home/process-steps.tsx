const steps = [
  {
    title: "Безплатна консултация",
    description:
      "Разговаряме човешки, за да разберем къде се намира бизнесът ти в момента и накъде искаш да стигне.",
  },
  {
    title: "Прозрачна оферта",
    description:
      "Изпращаме ти предложение, в което ясно виждаш кои услуги са ти нужни и как точно ще ти бъдат полезни.",
  },
  {
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
          Как работи процесът
        </h2>
        <p className="mt-4 text-muted-foreground md:text-lg">
          Три ясни стъпки – без сложни термини, без скрити такси.
        </p>
      </div>

      <ol className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="relative rounded-3xl border border-border bg-card p-7"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary font-heading text-2xl font-bold text-primary-foreground">
              {i + 1}
            </div>
            <h3 className="mt-5 font-heading text-xl font-bold text-foreground">
              {s.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {s.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
