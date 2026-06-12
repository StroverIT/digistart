"use client";

import { useRef } from "react";
import Image from "next/image";
import { LandingSection } from "@/components/services/service-detail-ready-store-v2/shared";
import {
  LANDING_REVEAL_CLASS,
  LANDING_CARD_CLASS,
} from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useLandingScrollAnimations } from "@/components/services/service-detail-ready-store-v2/use-landing-scroll-animations";

const BuiltInChat = () => {
  const sectionRef = useRef<HTMLElement>(null);
  useLandingScrollAnimations(sectionRef, { staggerReveal: 0.12, staggerCard: 0.18 });

  return (
    <LandingSection ref={sectionRef} id="support">
      <h1
        data-animate-reveal
        className={`mx-auto max-w-3xl text-center text-4xl ${LANDING_REVEAL_CLASS}`}
      >
        На всяка стъпка сме до теб — Google, Meta или и двете
      </h1>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <article
          data-animate-card
          className={`flex flex-col overflow-hidden rounded-2xl bg-[#111111] ${LANDING_CARD_CLASS}`}
        >
          <div className="relative flex items-center justify-center p-6">
            <div className="relative h-56 w-full sm:h-[20rem]">
              <Image
                src="/people/emil.png"
                alt="Екип за поддръжка на реклами"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
              />
            </div>
          </div>
          <div className="flex flex-1 flex-col px-6 py-8 sm:px-10">
            <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">Вграден чат</h2>
            <p className="mt-3 text-base leading-relaxed text-white">
              Питай за Google или Meta кампании, бюджети и резултати — отговаряме бързо и ясно
              (всеки ден от 9:00 до 22:00)
            </p>
          </div>
        </article>
        <article
          data-animate-card
          className={`flex flex-col overflow-hidden rounded-2xl border border-black bg-white ${LANDING_CARD_CLASS}`}
        >
          <div className="relative flex items-center justify-center p-6">
            <div className="relative h-56 w-full sm:h-[20rem]">
              <Image
                src="/people/nia.png"
                alt="Консултация за Google и Meta реклами"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
              />
            </div>
          </div>
          <div className="flex flex-1 flex-col px-6 py-8 sm:px-10">
            <h2 className="font-heading text-xl font-bold text-black sm:text-2xl">
              Няма глупави въпроси
            </h2>
            <p className="mt-3 text-base leading-relaxed text-black">
              Не разбираш числата в Google Ads или Meta Ads Manager? Питай ни. Обясняваме какво
              работи, какво спираме и защо.
            </p>
          </div>
        </article>
      </div>
    </LandingSection>
  );
};

export default BuiltInChat;
