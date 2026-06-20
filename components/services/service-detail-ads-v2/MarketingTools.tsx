"use client";

import { useRef } from "react";
import { Search, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import { LandingSection } from "@/components/services/service-detail-ready-store-v2/shared";
import {
  LANDING_CARD_CLASS,
  LANDING_HEADING_CLASS,
  LANDING_REVEAL_CLASS,
  LANDING_SECTION_TITLE_CENTER_CLASS,
} from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useLandingScrollAnimations } from "@/components/services/service-detail-ready-store-v2/use-landing-scroll-animations";

const cardClassName =
  "flex flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8 h-full";

function IconCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Search;
  title: string;
  description: string;
}) {
  return (
    <>
      <span className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-6" aria-hidden />
      </span>
      <h2 className="font-heading text-xl font-bold text-black">{title}</h2>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {description}
      </p>
    </>
  );
}

function ImageRightCard({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
      <div className="flex min-h-0 flex-1 flex-col lg:justify-center">
        <h2 className="font-heading text-xl font-bold text-black">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      <div className="relative aspect-5/4 w-full shrink-0 overflow-hidden rounded-xl lg:aspect-auto lg:min-h-0 lg:flex-1">
        <Image
          src={image}
          alt={title}
          fill
          className="object-contain object-center"
          sizes="(max-width: 1024px) 50vw, 50vw"
        />
      </div>
    </div>
  );
}

function ImageLeftCard({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-6 sm:flex-row sm:items-stretch sm:gap-8 lg:gap-10">
      <div className="relative min-h-52 w-full min-w-0 flex-1 overflow-hidden rounded-xl sm:min-h-48 lg:min-h-48 xl:min-h-56">
        <Image
          src={image}
          alt={title}
          fill
          className="object-contain object-left"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col sm:justify-center">
        <h2 className="font-heading text-xl font-bold text-black">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}

const MarketingTools = () => {
  const sectionRef = useRef<HTMLElement>(null);
  useLandingScrollAnimations(sectionRef, { staggerReveal: 0.12, staggerCard: 0.13 });

  return (
    <LandingSection
      ref={sectionRef}
      id="marketing"
      data-nav-theme="dark"
      withGradients
      className="bg-foreground text-background"
    >
      <h1
        data-animate-reveal
        className={`${LANDING_HEADING_CLASS} ${LANDING_SECTION_TITLE_CENTER_CLASS} ${LANDING_REVEAL_CLASS}`}
      >
        Защо да не рекламираш магазина сам?
      </h1>

      <ul className="mt-12 grid w-full list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[auto_auto_auto_auto] lg:[grid-template-areas:'stack_movement_movement'_'stack_google_google'_'channel_channel_channel'_'trackers_trackers_trackers']">
        <li className="contents lg:flex lg:flex-col lg:gap-5 lg:[grid-area:stack]">
          <article
            data-animate-card
            className={`${cardClassName} order-1 lg:order-0 ${LANDING_CARD_CLASS}`}
          >
            <IconCard
              icon={Sparkles}
              title="Не харчиш на сляпо"
              description="Целта не е трафик. Целта е хората да стигнат до продукт и да купят."
            />
          </article>
          <article
            data-animate-card
            className={`${cardClassName} order-2 lg:order-0 ${LANDING_CARD_CLASS}`}
          >
            <IconCard
              icon={Star}
              title="Подреждаме офертата"
              description="Цена, снимка, причина за покупка и ясно къде клиентът да натисне."
            />
          </article>
        </li>

        <li
          data-animate-card
          className={`${cardClassName} order-4 sm:col-span-2 lg:col-span-2 lg:min-h-64 ${LANDING_CARD_CLASS} lg:[grid-area:movement]`}
        >
          <ImageRightCard
            title="Пазим магазина в движение"
            description="Не плащаш просто за рекламна кампания. Плащаш за тестове, промени и решения според продажбите."
            image="/services/ads/marketing-tools/movement.png"
          />
        </li>

        <li
          data-animate-card
          className={`${cardClassName} order-5 sm:col-span-2 lg:col-span-2 ${LANDING_CARD_CLASS} lg:[grid-area:google]`}
        >
          <IconCard
            icon={Search}
            title="Не губиш време в кампании"
            description="Ние управляваме рекламите. Ти качваш продукти, обслужваш поръчки и пращаш доставки."
          />
        </li>

        <li
          data-animate-card
          className={`${cardClassName} order-3 w-full sm:col-span-2 lg:col-span-3 lg:min-h-64 xl:min-h-72 ${LANDING_CARD_CLASS} lg:[grid-area:channel]`}
        >
          <ImageRightCard
            title="Избираме правилния канал"
            description="Google за търсене на продукти. Meta за откриване, връщане и импулсни покупки."
            image="/services/ads/marketing-tools/right-channel.png"
          />
        </li>

        <li
          data-animate-card
          className={`${cardClassName} order-6 w-full ${LANDING_CARD_CLASS} sm:col-span-2 lg:[grid-area:trackers] lg:min-h-56 xl:min-h-64`}
        >
          <ImageLeftCard
            title="Засилваме продаващите продукти"
            description="Следим кои артикули носят поръчки и местим бюджета натам."
            image="/services/ads/marketing-tools/boosting.png"
          />
        </li>
      </ul>
    </LandingSection>
  );
};

export default MarketingTools;
