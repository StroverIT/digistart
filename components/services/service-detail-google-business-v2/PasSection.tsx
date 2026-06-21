"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { LandingSection } from "@/components/services/service-detail-ready-store-v2/shared";
import {
  LANDING_BODY_CLASS,
  LANDING_CARD_CLASS,
  LANDING_HEADING_CLASS,
  LANDING_REVEAL_CLASS,
  LANDING_SECTION_TITLE_LEFT_CLASS,
} from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useCreativesAnimations } from "@/components/services/service-detail-ads-v2/use-creatives-animations";
import { ImagePlaceholder } from "./ImagePlaceholder";

const PAS_ITEMS = [
  {
    title: "Разчиташ на минувачи и препоръки",
    description:
      "Имаш страхотен продукт или услуга, но когато някой чуе за теб и те потърси в Google или на картата, не намира нищо, или по-лошо – попада на объркваща и стара информация.",
    width: 800,
    height: 800,
    imageFirst: false,
  },
  {
    title: "Губиш сигурни клиенти, защото си невидим",
    description:
      "Добрият продукт и локацията вече не са достатъчни. 78% от локалните мобилни търсения водят до действие в рамките на същия ден. Ако нямаш официален профил със снимки, работно време и отзиви, клиентът приема покупката за рискова. Докато ти разчиташ на случайни минувачи, конкурентите ти с по-добра дигитална следа обират хората, които активно търсят точно това, което ти предлагаш.",
    width: 800,
    height: 800,
    imageFirst: true,
  },
  {
    title: "Дигитализираме твоята витрина и доверието",
    description:
      "Създаваме безупречен Google Business профил, който излиза първи при локално търсене. Ние поемаме черната работа онлайн, за да можеш ти да обслужваш хората в обекта си.",
    width: 800,
    height: 800,
    imageFirst: false,
  },
] as const;

function DescriptionParagraphs({ text }: { text: string }) {
  const sentences = text
    .split(/(?<=\.)\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
      {sentences.map((sentence) => (
        <p key={sentence}>{sentence}</p>
      ))}
    </div>
  );
}

const PasSection = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useCreativesAnimations(sectionRef);

  return (
    <LandingSection ref={sectionRef} id="creatives">
      <div className="flex flex-col md:flex-row justify-between text-center">
        <div className="flex justify-start">
          <h2
            data-animate-reveal
            className={`${LANDING_HEADING_CLASS} ${LANDING_SECTION_TITLE_LEFT_CLASS} md:text-left ${LANDING_REVEAL_CLASS}`}
          >
            Защо клиентите не те намират?
          </h2>
        </div>
        <p
          data-animate-reveal
          className={`mt-4 max-w-lg md:text-left ${LANDING_BODY_CLASS} ${LANDING_REVEAL_CLASS}`}
        >
          Без Google профил губиш клиенти, преди да стигнат до обекта
          ти.
        </p>
      </div>

      <div data-animate-grid className="mt-10 flex flex-col gap-14 md:mt-14 lg:gap-20">
        {PAS_ITEMS.map((item) => (
          <article
            key={item.title}
            data-animate-card
            className={cn(
              "group grid items-center gap-8 lg:grid-cols-2 lg:gap-16",
              LANDING_CARD_CLASS,
            )}
          >
            <div
              data-animate-card-copy
              className={cn(
                "order-1 space-y-3 opacity-0 lg:py-4",
                item.imageFirst ? "lg:order-2" : "lg:order-1",
              )}
            >
              <h3 className="font-heading text-xl font-semibold leading-snug text-foreground sm:text-2xl">
                {item.title}
              </h3>
              <DescriptionParagraphs text={item.description} />
            </div>

            <div
              data-animate-card-image
              className={cn(
                "relative order-2 w-full overflow-hidden rounded-2xl md:will-change-transform",
                item.imageFirst ? "lg:order-1" : "lg:order-2",
              )}
            >
              <ImagePlaceholder
                width={item.width}
                height={item.height}
                label={item.title}
                className="rounded-2xl"
              />
            </div>
          </article>
        ))}
      </div>
    </LandingSection>
  );
};

export default PasSection;
