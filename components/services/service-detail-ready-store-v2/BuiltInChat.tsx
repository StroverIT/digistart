"use client";

import { useRef } from "react";
import Image from "next/image";
import { LandingSection } from "./shared";
import { LANDING_REVEAL_CLASS, LANDING_CARD_CLASS } from "./landing-animation-classes";
import { useLandingScrollAnimations } from "./use-landing-scroll-animations";

const BuiltInChat = () => {
  const sectionRef = useRef<HTMLElement>(null);
  useLandingScrollAnimations(sectionRef, { staggerReveal: 0.12, staggerCard: 0.18 });

  return (
    <LandingSection ref={sectionRef} id="support">
      <h1
        data-animate-reveal
        className={`mx-auto max-w-3xl text-center text-4xl ${LANDING_REVEAL_CLASS}`}
      >
        На всяка стъпка сме до теб
      </h1>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <article
          data-animate-card
          className={`flex flex-col overflow-hidden rounded-2xl bg-[#111111] ${LANDING_CARD_CLASS}`}
        >
          <div className="relative flex items-center justify-center p-6">
            <div className="relative h-56 w-full sm:h-[20rem]">
              <Image
                src="/chat/ask-for-help.webp"
                alt="Вграден чат"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="flex flex-1 flex-col px-6 py-8 sm:px-10">
            <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">Вграден чат</h2>
            <p className="mt-3 text-base leading-relaxed text-white">
              Имаме вътрешен чат за да може да отговорим на въпросите ти бързо и ефективно (всеки ден от 9:00 до 22:00)
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
                src="/chat/ask-for-help-chat.webp"
                alt="Различни чатове за различни нужди"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="flex flex-1 flex-col px-6 py-8 sm:px-10">
            <h2 className="font-heading text-xl font-bold text-black sm:text-2xl">
              Няма глупави въпроси
            </h2>
            <p className="mt-3 text-base leading-relaxed text-black">
              Може да ни питаш каквото искаш. Ние ще помогнем. За да сме още по-организирани, сме направили възможност за различни теми.
            </p>
          </div>
        </article>
      </div>
    </LandingSection>
  );
};

export default BuiltInChat;
