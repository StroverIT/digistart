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
import { useLandingScrollAnimations } from "@/components/services/service-detail-ready-store-v2/use-landing-scroll-animations";

const FEATURED_CREATIVES = [
  {
    src: "/ads/searching.png",
    alt: "Клиентите намират продуктите ти",
    label: "Клиентите намират продуктите",
  },
  {
    src: "/ads/catalog.png",
    alt: "Каталогът ти се вижда ясно",
    label: "Каталогът ти се вижда",
  },
  {
    src: "/ads/remembering.png",
    alt: "Хората запомнят артикулите",
    label: "Хората запомнят артикулите",
  },
  {
    src: "/ads/returning-back-to-cart.png",
    alt: "Връщаме изоставените колички",
    label: "Връщаме изоставените колички",
  },
] as const;

const Creatives = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useLandingScrollAnimations(sectionRef, {
    staggerReveal: 0.12,
    cardsOnViewIndividually: true,
    cardStart: "top 88%",
  });

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

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:mt-14">
        {FEATURED_CREATIVES.map((creative) => (
          <article
            key={creative.label}
            data-animate-card
            className={`overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm ${LANDING_CARD_CLASS}`}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40">
              <Image
                src={creative.src}
                alt={creative.alt}
                fill
                className="object-cover object-center"
                sizes="(max-width: 640px) 100vw, 50vw"
              />

            </div>
            <p className="border-t border-border/60 px-5 py-4 text-center text-sm font-semibold text-foreground">
              {creative.label}
            </p>
          </article>
        ))}
      </div>
    </LandingSection>
  );
};

export default Creatives;
