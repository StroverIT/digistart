"use client";

import { useRef } from "react";
import Image from "next/image";
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

const PAS_ITEMS = [
  {
    title: "Пускаш по нещо от време на време, колкото да има",
    description:
      "Имаш страхотен продукт, но профилът ти в Instagram или Facebook изглежда като на любител. Нямаш време да мислиш текстове, да обработваш снимки, да правиш видеа и да следиш какво работи в момента.",
    image: "/services/social-media/benefits/time-to-time.png",
    imageFirst: false,
  },
  {
    title: "Хората виждат хаос или последен пост от преди 3 месеца",
    description:
      "Влизат в профила ти, виждат неактивност и си тръгват, приемайки, че бизнесът не е сериозен. „Boost“-ваш постове на сляпо, плащаш на Meta, събираш лайкове, но съобщения за реални поръчки няма. Конкуренцията обира потенциалните ти клиенти.",
    image: "/services/social-media/benefits/boosting.png",
    imageFirst: true,
  },
  {
    title: "Професионална дигитална витрина, която вдъхва доверие",
    description:
      "Изграждаме стратегия, оформяме визиите, пишем грабващи текстове и публикуваме регулярно вместо теб. Ние поемаме черната работа онлайн, за да можеш ти да ръководиш бизнеса си и да пакетираш поръчките спокойно.",
    image: "/services/social-media/benefits/professional.png",
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
            Защо профилът ти не продава?
          </h2>
        </div>
        <p
          data-animate-reveal
          className={`mt-4 max-w-lg md:text-left ${LANDING_BODY_CLASS} ${LANDING_REVEAL_CLASS}`}
        >
          Бъди честен със себе си - хаотичната витрина отблъсква клиенти, преди да стигнат до
          поръчка.
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
                "relative order-2 aspect-square w-full overflow-hidden rounded-2xl will-change-transform",
                item.imageFirst ? "lg:order-1" : "lg:order-2",
              )}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </article>
        ))}
      </div>
    </LandingSection>
  );
};

export default PasSection;
