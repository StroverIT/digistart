"use client";

import { useRef } from "react";
import Image from "next/image";
import { LandingSection } from "@/components/services/service-detail-ready-store-v2/shared";
import {
  LANDING_BODY_CLASS,
  LANDING_CARD_CLASS,
  LANDING_HEADING_CLASS,
  LANDING_REVEAL_CLASS,
  LANDING_SECTION_TITLE_LEFT_CLASS,
} from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useCreativesAnimations } from "@/components/services/service-detail-ads-v2/use-creatives-animations";

const FEATURED_CREATIVES = [
  {
    src: "/ads/searching.png",
    alt: "Клиентите намират продуктите ти",
    label: "Клиентите намират продуктите",
    description:
      "Search и Shopping реклами показват артикулите ти, когато някой активно търси подобни продукти в Google.",
  },
  {
    src: "/ads/catalog.png",
    alt: "Каталогът ти се вижда ясно",
    label: "Каталогът ти се вижда",
    description:
      "Dynamic ads изваждат целия каталог във Facebook и Instagram – всеки продукт с цена и снимка.",
  },
  {
    src: "/ads/remembering.png",
    alt: "Хората запомнят артикулите",
    label: "Хората запомнят артикулите",
    description:
      "Retargeting напомня на посетителите артикулите, които разгледаха, но не купиха.",
  },
  {
    src: "/ads/returning-back-to-cart.png",
    alt: "Връщаме изоставените колички",
    label: "Връщаме изоставените колички",
    description:
      "Напомняне за незавършена количка връща хората обратно точно преди плащане.",
  },
] as const;

const Creatives = () => {
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
            Реклами за онлайн поръчки
          </h2>
        </div>
        <p
          data-animate-reveal
          className={`mt-4 max-w-lg md:text-left ${LANDING_BODY_CLASS} ${LANDING_REVEAL_CLASS}`}
        >
          Водим хората към продукта, количката и завършена покупка.
        </p>
      </div>

      <div
        data-animate-grid
        className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 md:mt-14 lg:gap-x-10 lg:gap-y-14"
      >
        {FEATURED_CREATIVES.map((creative) => (
          <article
            key={creative.label}
            data-animate-card
            className={`group flex flex-col ${LANDING_CARD_CLASS}`}
          >
            <div
              data-animate-card-image
              className="relative aspect-square w-full overflow-hidden rounded-2xl will-change-transform"
            >
              <Image
                src={creative.src}
                alt={creative.alt}
                fill
                className="object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
            <div
              data-animate-card-copy
              className="mt-4 space-y-1.5 opacity-0 sm:mt-5"
            >
              <h3 className="font-heading text-base font-semibold leading-snug text-foreground sm:text-lg">
                {creative.label}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {creative.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </LandingSection>
  );
};

export default Creatives;
