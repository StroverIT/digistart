"use client";

import { useEffect, useRef } from "react";
import { MessageSquare, Lightbulb, Code2, Rocket } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    icon: <MessageSquare className="h-6 w-6" />,
    number: "01",
    title: "Диагностика",
    description:
      "Разбираме как продавате днес, какви стоки имате и кои процеси трябва да останат лесни за вас.",
  },
  {
    icon: <Lightbulb className="h-6 w-6" />,
    number: "02",
    title: "План за старт",
    description:
      "Избираме най-краткия път до първи онлайн продажби: магазин, плащания, куриер, Google и социални мрежи.",
  },
  {
    icon: <Code2 className="h-6 w-6" />,
    number: "03",
    title: "Работещо демо",
    description:
      "Показваме реална версия на магазина, за да видите визията, поръчките и основните настройки преди старт.",
  },
  {
    icon: <Rocket className="h-6 w-6" />,
    number: "04",
    title: "Пускане и растеж",
    description:
      "Пускаме онлайн канала и надграждаме с реклама, съдържание и локална видимост според резултатите.",
  },
];

export function ProcessSection() {
  const containerRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      gsap.set([eyebrowRef.current, titleRef.current, descRef.current], {
        opacity: 0,
        y: 40,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "back.out(1.6)" },
      });

      tl.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0)
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.55 }, "-=0.25")
        .to(descRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25");

      const cards = stepRefs.current.filter(Boolean);
      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 50, scale: 0.95 });
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="process" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span
            ref={eyebrowRef}
            className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block opacity-0 translate-y-10"
          >
            Как работим
          </span>
          <h2
            ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance opacity-0 translate-y-10"
          >
            От витрината до <span className="gradient-text">първата онлайн поръчка</span>
          </h2>
          <p
            ref={descRef}
            className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
          >
            Без технически жаргон и без големи обещания на сляпо. Започваме с ясна версия, която може
            да продава, после надграждаме според данните.
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
                <div
                  ref={(el) => {
                    stepRefs.current[index] = el;
                  }}
                  className="bg-card border border-border rounded-xl p-6 h-full hover:border-primary/50 transition-colors group opacity-0 translate-y-10"
                >
                  {/* Number badge */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {step.icon}
                    </div>
                    <span className="text-3xl font-bold text-muted-foreground/30">{step.number}</span>
                  </div>

                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
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
