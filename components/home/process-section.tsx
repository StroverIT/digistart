import { MessageSquare, Lightbulb, Code2, Rocket } from "lucide-react";

const steps = [
  {
    icon: <MessageSquare className="h-6 w-6" />,
    number: "01",
    title: "Плащане",
    description:
      "След като уточним офертата, извършвате плащане и официално запазвате старта на проекта.",
  },
  {
    icon: <Lightbulb className="h-6 w-6" />,
    number: "02",
    title: "Стратегия",
    description:
      "Създаваме ясна стратегия с обхват, приоритети и план за изпълнение според вашите цели.",
  },
  {
    icon: <Code2 className="h-6 w-6" />,
    number: "03",
    title: "Демо",
    description:
      "Показваме ви демо версия, за да прегледате визията и функционалностите преди същинската работа.",
  },
  {
    icon: <Rocket className="h-6 w-6" />,
    number: "04",
    title: "Официален старт",
    description:
      "След одобрение стартираме официално проекта и преминаваме към пълната реализация по плана.",
  },
];

export function ProcessSection() {
  return (
    <section id="process" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
            Как работим
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance">
            От идея до{" "}
            <span className="gradient-text">реалност</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Нашият процес е прозрачен и ефективен. Знаете точно какво да очаквате на всяка стъпка.
          </p>
        </div>

        {/* Process steps */}
        <div className="relative">
          {/* Connection line - desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-border to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Step card */}
                <div className="bg-card border border-border rounded-xl p-6 h-full hover:border-primary/50 transition-colors group">
                  {/* Number badge */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {step.icon}
                    </div>
                    <span className="text-3xl font-bold text-muted-foreground/30">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector - mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <div className="h-8 w-0.5 bg-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
