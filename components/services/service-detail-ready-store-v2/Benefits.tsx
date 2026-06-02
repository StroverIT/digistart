"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LandingSection, LandingSectionTitle } from "./shared";

const benefits = [
  {
    title: "Автоматично създаване на товарителници",
    description:
      "Автоматично при създаване и връщане на поръчка се създава товарителница от избрания доставчик",
    image: "/templates/clothing/11.png",
  },
  {
    title: "Онлайн плащания",
    description: "Клиентите ти имат възможност да плащат с абсолютно всичко което пожелаеш",
    image: "/templates/clothing/11.png",
  },
  {
    title: "Вграден пиксел",
    description: "",
    image: "/templates/clothing/11.png",
  },
  {
    title: "Digi Analytics",
    description: "Наши системи които проследяват клиентите ти за специализирано преживяване",
    image: "/templates/clothing/11.png",
  },
  {
    title: "Включен Hosting и SSL сертификат",
    description:
      "Ние се грижим за цялата техническа част. Твоята грижа е само да изпращаш пратки",
    image: "/templates/clothing/11.png",
  },
] as const;

const Benefits = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = benefits[activeIndex];

  return (
    <LandingSection id="benefits">
      <LandingSectionTitle as="h1" className="max-w-4xl mx-auto">
        Създай онлайн магазин за рекордно време - започни от нула до това да продаваш в рамките на
        часове, не седмици
      </LandingSectionTitle>

      <article className="mt-12 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <ul className="divide-y divide-border rounded-2xl border border-border/80 bg-card shadow-sm">
          {benefits.map((benefit, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={benefit.title}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "w-full px-5 py-5 text-left transition-colors sm:px-6",
                    isActive ? "bg-primary/5" : "hover:bg-muted/50",
                  )}
                >
                  <h2
                    className={cn(
                      "text-lg font-semibold sm:text-xl",
                      isActive ? "text-primary" : "text-foreground",
                    )}
                  >
                    {benefit.title}
                  </h2>
                  {benefit.description ? (
                    <p
                      className={cn(
                        "mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base",
                        !isActive && "line-clamp-2",
                      )}
                    >
                      {benefit.description}
                    </p>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl border border-border/80 bg-muted/30 shadow-lg lg:max-w-none lg:sticky lg:top-36">
          <Image
            src={active.image}
            alt={active.title}
            fill
            className="object-contain p-4 transition-opacity duration-300"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
      </article>
    </LandingSection>
  );
};

export default Benefits;
