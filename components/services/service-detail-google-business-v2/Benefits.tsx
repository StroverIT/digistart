"use client";

import { useRef } from "react";
import {
  Clock,
  LayoutGrid,
  MapPin,
  Search,
  Star,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LandingSection } from "@/components/services/service-detail-ready-store-v2/shared";
import {
  LANDING_CARD_CLASS,
  LANDING_HEADING_CLASS,
  LANDING_REVEAL_CLASS,
  LANDING_SECTION_TITLE_CENTER_CLASS,
} from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useLandingScrollAnimations } from "@/components/services/service-detail-ready-store-v2/use-landing-scroll-animations";
import { ImagePlaceholder } from "./ImagePlaceholder";

const cardClassName =
  "flex flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8 h-full";

const HOW_WE_HELP_BLOCKS = [
  {
    number: "01",
    icon: MapPin,
    title: "Край на невидимостта в мрежата",
    description:
      "Правим пълна регистрация и техническа верификация. Когато някой потърси името ти, веднага вижда официален профил с голяма карта, снимки и директен бутон за обаждане.",
    layout: "icon" as const,
    gridArea: "visibility",
  },
  {
    number: "02",
    icon: Search,
    title: "Обираш локалните търсения",
    description:
      "Оптимизираме профила ти с правилните ключови думи. Ако някой търси „най-близкият магазин за дрехи“, „магазин за обувки“ или „магазин за бижута“, твоят бизнес излиза на предни позиции в картите.",
    layout: "icon" as const,
    gridArea: "local",
  },
  {
    number: "03",
    icon: Star,
    title: "Изграждаме доверие с отзиви",
    description:
      "Настройваме процеси за лесно събиране на ревюта. Когато новите клиенти видят висок рейтинг и доволни мнения, те избират теб пред конкуренцията, без да се замислят.",
    layout: "image-bottom" as const,
    imageWidth: 640,
    imageHeight: 480,
    gridArea: "reviews",
  },
  {
    number: "04",
    icon: LayoutGrid,
    title: "Подреждаме дигиталната ти витрина",
    description:
      "Качваме актуални снимки на обекта, менюто или най-продаваните ти продукти. Клиентите виждат точно какво предлагаш още преди да са прекрачили прага ти.",
    layout: "icon" as const,
    gridArea: "showcase",
  },
  {
    number: "05",
    icon: Clock,
    title: "Винаги актуална информация",
    description:
      "Слагаме край на изгубените клиенти, които идват пред затворена врата. Въвеждаме точно работно време, почивни дни за празниците, точен адрес и телефон за резервации или въпроси.",
    layout: "image-right" as const,
    imageWidth: 800,
    imageHeight: 640,
    gridArea: "info",
  },
  {
    number: "06",
    icon: UserCheck,
    title: "Не си губиш времето с настройки",
    description:
      "Ти си експерт в твоята сфера, а ние в нашата. Поемаме целия процес по изграждането на профила, за да можеш ти да вложиш енергията си в посрещането на новите клиенти в обекта.",
    layout: "image-left" as const,
    imageWidth: 960,
    imageHeight: 540,
    gridArea: "time",
  },
] as const;

function NumberedIconCard({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <>
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-6" aria-hidden />
        </span>
        <span className="text-4xl font-bold leading-none text-muted-foreground/20 tabular-nums select-none">
          {number}
        </span>
      </div>
      <h2 className="font-heading text-xl font-bold text-black">{title}</h2>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {description}
      </p>
    </>
  );
}

function ImageBottomBlock({
  number,
  title,
  description,
  width,
  height,
}: {
  number: string;
  title: string;
  description: string;
  width: number;
  height: number;
}) {
  return (
    <>
      <span className="mb-4 block text-right text-4xl font-bold leading-none text-muted-foreground/20 tabular-nums select-none">
        {number}
      </span>
      <h2 className="font-heading text-xl font-bold text-black">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {description}
      </p>
      <div className="relative mt-6 w-full overflow-hidden rounded-xl">
        <ImagePlaceholder width={width} height={height} label={title} />
      </div>
    </>
  );
}

function ImageRightBlock({
  number,
  title,
  description,
  width,
  height,
}: {
  number: string;
  title: string;
  description: string;
  width: number;
  height: number;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-6 sm:flex-row sm:items-center sm:gap-8 lg:gap-10">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col sm:justify-center">
        <span className="mb-3 block text-4xl font-bold leading-none text-muted-foreground/20 tabular-nums select-none">
          {number}
        </span>
        <h2 className="font-heading text-xl font-bold text-black">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      <div className="flex min-h-52 w-full min-w-0 flex-1 items-center justify-center overflow-hidden rounded-xl sm:min-h-48">
        <ImagePlaceholder width={width} height={height} label={title} className="w-full" />
      </div>
    </div>
  );
}

function ImageLeftBlock({
  number,
  title,
  description,
  width,
  height,
}: {
  number: string;
  title: string;
  description: string;
  width: number;
  height: number;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-6 sm:flex-row sm:items-stretch sm:gap-8 lg:gap-10">
      <div className="relative min-h-52 w-full min-w-0 flex-1 overflow-hidden rounded-xl sm:min-h-48">
        <ImagePlaceholder width={width} height={height} label={title} />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col sm:justify-center">
        <span className="mb-3 block text-4xl font-bold leading-none text-muted-foreground/20 tabular-nums select-none">
          {number}
        </span>
        <h2 className="font-heading text-xl font-bold text-black">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}

const Benefits = () => {
  const sectionRef = useRef<HTMLElement>(null);
  useLandingScrollAnimations(sectionRef, { staggerReveal: 0.12, staggerCard: 0.13 });

  const [block1, block2, block3, block4, block5, block6] = HOW_WE_HELP_BLOCKS;

  return (
    <LandingSection
      ref={sectionRef}
      id="benefits"
      data-nav-theme="dark"
      withGradients
      className="border-background/15 bg-foreground text-background"
    >
      <h1
        data-animate-reveal
        className={`${LANDING_HEADING_CLASS} ${LANDING_SECTION_TITLE_CENTER_CLASS} ${LANDING_REVEAL_CLASS}`}
      >
        Как помагаме на бизнеса ти?
      </h1>

      <ul className="mt-12 grid w-full list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[minmax(11rem,1fr)_minmax(14rem,1fr)_auto] lg:[grid-template-areas:'visibility_local_reviews'_'showcase_info_info'_'time_time_time']">
        <li
          data-animate-card
          className={cn(cardClassName, "order-1", LANDING_CARD_CLASS, "lg:[grid-area:visibility]")}
        >
          <NumberedIconCard
            number={block1.number}
            icon={block1.icon}
            title={block1.title}
            description={block1.description}
          />
        </li>

        <li
          data-animate-card
          className={cn(cardClassName, "order-2", LANDING_CARD_CLASS, "lg:[grid-area:local]")}
        >
          <NumberedIconCard
            number={block2.number}
            icon={block2.icon}
            title={block2.title}
            description={block2.description}
          />
        </li>

        <li
          data-animate-card
          className={cn(
            cardClassName,
            "order-3",
            LANDING_CARD_CLASS,
            "lg:[grid-area:reviews]",
          )}
        >
          <ImageBottomBlock
            number={block3.number}
            title={block3.title}
            description={block3.description}
            width={block3.imageWidth}
            height={block3.imageHeight}
          />
        </li>

        <li
          data-animate-card
          className={cn(cardClassName, "order-4", LANDING_CARD_CLASS, "lg:[grid-area:showcase]")}
        >
          <NumberedIconCard
            number={block4.number}
            icon={block4.icon}
            title={block4.title}
            description={block4.description}
          />
        </li>

        <li
          data-animate-card
          className={cn(
            cardClassName,
            "order-5 w-full",
            LANDING_CARD_CLASS,
            "sm:col-span-2 lg:[grid-area:info] lg:min-h-56 xl:min-h-64",
          )}
        >
          <ImageRightBlock
            number={block5.number}
            title={block5.title}
            description={block5.description}
            width={block5.imageWidth}
            height={block5.imageHeight}
          />
        </li>

        <li
          data-animate-card
          className={cn(
            cardClassName,
            "order-6 w-full",
            LANDING_CARD_CLASS,
            "sm:col-span-2 lg:[grid-area:time] lg:min-h-56 xl:min-h-64",
          )}
        >
          <ImageLeftBlock
            number={block6.number}
            title={block6.title}
            description={block6.description}
            width={block6.imageWidth}
            height={block6.imageHeight}
          />
        </li>
      </ul>
    </LandingSection>
  );
};

export default Benefits;
