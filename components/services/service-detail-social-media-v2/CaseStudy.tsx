"use client";

import { useRef } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { LandingSection } from "@/components/services/service-detail-ready-store-v2/shared";
import {
  LANDING_CARD_CLASS,
  LANDING_HEADING_CLASS,
  LANDING_REVEAL_CLASS,
  LANDING_SECTION_TITLE_CENTER_CLASS,
} from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useLandingScrollAnimations } from "@/components/services/service-detail-ready-store-v2/use-landing-scroll-animations";

const stars = Array.from({ length: 5 });

const CaseStudy = () => {
  const sectionRef = useRef<HTMLElement>(null);
  useLandingScrollAnimations(sectionRef, { staggerReveal: 0.12, staggerCard: 0.16 });

  return (
    <LandingSection ref={sectionRef} id="case-study" className="bg-muted/30">
      <h1
        data-animate-reveal
        className={`${LANDING_HEADING_CLASS} ${LANDING_SECTION_TITLE_CENTER_CLASS} ${LANDING_REVEAL_CLASS}`}
      >
        Как реално изглежда добрият профил
      </h1>

      <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div
          data-animate-card
          className={`relative order-2 w-full min-h-80 sm:min-h-96 lg:min-h-[32rem] xl:min-h-[36rem] lg:order-1 ${LANDING_CARD_CLASS}`}
        >
          <Image
            src="/what-we-offer/restyled-mock-up.png"
            alt="Restyled - Instagram витрина преди и след"
            fill
            className="object-contain object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
            loading="lazy"
          />
        </div>

        <div className="order-1 space-y-6 lg:order-2">
          <div data-animate-reveal className={`space-y-2 ${LANDING_REVEAL_CLASS}`}>
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">Restyled</h2>
            <div className="flex items-center gap-1" role="img" aria-label="5 от 5 звезди">
              {stars.map((_, index) => (
                <Star key={index} className="size-5 text-amber-400" fill="currentColor" />
              ))}
            </div>
          </div>
          <p
            data-animate-reveal
            className={`text-base leading-relaxed sm:text-lg ${LANDING_REVEAL_CLASS}`}
          >
            <span className="font-bold">Преди:</span> Качване на непрофесионални снимки директно от
            телефона, без ясно описание или призив за действие. Липса на постоянство.
          </p>
          <p
            data-animate-reveal
            className={`border-t border-gray-200 pt-4 text-base leading-relaxed text-foreground sm:text-lg ${LANDING_REVEAL_CLASS}`}
          >
            <span className="font-bold">След:</span> Подредена и естетична Instagram витрина.
            Регулярни постове и Reels, които показват дрехите в действие. Изградена лоялна
            аудитория, която чака с нетърпение новите колекции и купува на момента.
          </p>
        </div>
      </div>
    </LandingSection>
  );
};

export default CaseStudy;
