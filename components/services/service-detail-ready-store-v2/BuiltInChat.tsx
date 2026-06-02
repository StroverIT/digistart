import Image from "next/image";
import { LandingSection, LandingSectionTitle } from "./shared";

const chatFeatures = [
  {
    title: "Вграден чат",
    description:
      "Имаме вътрешен чат за да може да отговорим на въпросите ти бързо и ефективно (всеки ден от 9:00 до 22:00)",
    image: "/ask-for-help-3.png",
    gradient: "from-primary/15 via-primary/5 to-background",
  },
  {
    title: "Различни чатове за различни нужди",
    description:
      "Може да отваряш колкото си искаш чатове за различни въпроси. Организираността е на първо място",
    image: "/ask-for-help-chat.png",
    gradient: "from-muted via-background to-primary/10",
  },
] as const;

const BuiltInChat = () => {
  return (
    <LandingSection id="support">
      <LandingSectionTitle as="h1" className="max-w-3xl mx-auto">
        На всяка стъпка сме винаги до теб
      </LandingSectionTitle>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {chatFeatures.map((feature) => (
          <article
            key={feature.title}
            className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm"
          >
            <div
              className={`relative flex min-h-[280px] items-center justify-center bg-gradient-to-br p-6 sm:min-h-[320px] ${feature.gradient}`}
            >
              <div className="relative h-56 w-full max-w-sm sm:h-64">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
            <div className="flex flex-1 flex-col px-6 py-8 sm:px-8">
              <h2 className="font-heading text-xl font-bold sm:text-2xl">{feature.title}</h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </LandingSection>
  );
};

export default BuiltInChat;
