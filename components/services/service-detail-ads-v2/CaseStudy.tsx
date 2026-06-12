"use client";

import { useRef } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { LandingSection } from "@/components/services/service-detail-ready-store-v2/shared";
import {
  LANDING_REVEAL_CLASS,
  LANDING_CARD_CLASS,
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
        className={`mx-auto max-w-3xl text-center text-5xl ${LANDING_REVEAL_CLASS}`}
      >
        Как изглеждат реални резултати от Google и Meta реклами
      </h1>

      <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div
          data-animate-card
          className={`relative order-2 aspect-[4/3] w-full lg:order-1 ${LANDING_CARD_CLASS}`}
        >
          <Image
            src="/what-we-offer/reaz-mock-up.png"
            alt="Кейс с Google и Meta реклами"
            fill
            className="object-contain p-4"
            sizes="(max-width: 1024px) 100vw, 50vw"
            loading="lazy"
          />
        </div>

        <div className="order-1 space-y-6 lg:order-2">
          <div data-animate-reveal className={`space-y-2 ${LANDING_REVEAL_CLASS}`}>
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">Reaz</h2>
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
            <span className="font-bold">Преди:</span> boost в Meta без стратегия и никакво търсене в
            Google. Бюджетът изчезваше в харесвания, а двата Ads Manager-а парализираха с числа без
            смисъл.
          </p>
          <p
            data-animate-reveal
            className={`border-t border-gray-200 pt-4 text-base leading-relaxed text-foreground sm:text-lg ${LANDING_REVEAL_CLASS}`}
          >
            <span className="font-bold">След:</span> Google носи поръчки от търсене, Meta изгражда
            аудитория с визуални реклами. Ясно проследяване, месечни корекции — и знаеш кой канал
            колко струва и колко продава.
          </p>
        </div>
      </div>
    </LandingSection>
  );
};

export default CaseStudy;
