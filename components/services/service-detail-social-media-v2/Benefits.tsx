"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  CalendarCheck,
  Clock,
  LayoutGrid,
  PenLine,
  Target,
  Users,
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
const cardClassName =
  "flex flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8 h-full";

const HOW_WE_HELP_BLOCKS = [
  {
    number: "01",
    icon: Clock,
    title: "Не губиш време в писане и публикуване",
    description:
      "Ние планираме, създаваме и качваме съдържанието. Ти само ни подаваш сурови кадри от обекта или продуктите си, а освободеното време инвестираш в реално обслужване на клиентите.",
    layout: "icon" as const,
    gridArea: "time",
  },
  {
    number: "02",
    icon: Target,
    title: "Целта е продажби, не просто лайкове",
    description:
      "Красивата снимка сама по себе си не е достатъчна. Всяка наша публикация разказва историята на продукта, показва ползите му и дава ясна причина на хората да купят точно от теб.",
    layout: "icon" as const,
    gridArea: "sales",
  },
  {
    number: "03",
    icon: CalendarCheck,
    title: "Край на месеците без нито един пост",
    description:
      "Осигуряваме пълно постоянство и пазим профила ти в движение. Витрината ти се обновява редовно, което показва на клиентите, че бизнесът ти е жив, активен и могат да ти се доверят.",
    layout: "image-bottom" as const,
    image: "/services/social-media/business/active.png",
    imageWidth: 938,
    imageHeight: 938,
    gridArea: "consistency",
  },
  {
    number: "04",
    icon: LayoutGrid,
    title: "Подреждаме визуалната ти витрина",
    description:
      "Обработваме материалите ти така, че да изглеждат професионално и обединени от единен бранд. Когато нов човек влезе в профила ти, той веднага вижда сериозен бизнес, а не любителски опит.",
    layout: "icon" as const,
    gridArea: "visual",
  },
  {
    number: "05",
    icon: PenLine,
    title: "Пишем текстове с ясен призив (CTA)",
    description:
      "Спираш да се чудиш какво да напишеш под снимката. Създаваме ангажиращи описания, които винаги завършват с ясно упътване къде клиентът да кликне, за да разгледа или да поръча.",
    layout: "image-right" as const,
    image: "/services/social-media/business/cta.png",
    imageWidth: 938,
    imageHeight: 938,
    gridArea: "cta",
  },
  {
    number: "06",
    icon: Users,
    title: "Човешки подход без AI роботизация",
    description:
      "Зад всеки проект в DigiStart стои реален човек, когото го е грижа за твоя бизнес, а не безличен AI. Не използваме роботизиран език и изтъркани шаблони, а говорим на клиентите ти по човешки, градейки реално доверие.",
    layout: "image-left" as const,
    image: "/services/social-media/business/ai.png",
    imageWidth: 1250,
    imageHeight: 625,
    gridArea: "human",
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
  image,
  width,
  height,
}: {
  number: string;
  title: string;
  description: string;
  image: string;
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
      <div
        className="relative mt-6 w-full overflow-hidden rounded-xl"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <Image
          src={image}
          alt={title}
          fill
          className="object-contain object-center"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
      </div>
    </>
  );
}

function ImageRightBlock({
  number,
  title,
  description,
  image,
  width,
  height,
}: {
  number: string;
  title: string;
  description: string;
  image: string;
  width: number;
  height: number;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
      <div className="flex min-h-0 flex-1 flex-col lg:justify-center">
        <span className="mb-3 block text-4xl font-bold leading-none text-muted-foreground/20 tabular-nums select-none">
          {number}
        </span>
        <h2 className="font-heading text-xl font-bold text-black">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      <div
        className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <Image
          src={image}
          alt={title}
          fill
          className="object-contain object-center"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
    </div>
  );
}

function ImageLeftBlock({
  number,
  title,
  description,
  image,
  width,
  height,
}: {
  number: string;
  title: string;
  description: string;
  image: string;
  width: number;
  height: number;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-6 sm:flex-row sm:items-stretch sm:gap-8 lg:gap-10">
      <div
        className="relative min-h-52 w-full min-w-0 flex-1 overflow-hidden rounded-xl sm:min-h-48"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <Image
          src={image}
          alt={title}
          fill
          className="object-contain object-center"
          sizes="(max-width: 640px) 100vw, 66vw"
        />
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

      <ul className="mt-12 grid w-full list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[minmax(11rem,1fr)_minmax(14rem,1fr)_auto] lg:[grid-template-areas:'time_sales_consistency'_'visual_cta_cta'_'human_human_human']">
        <li
          data-animate-card
          className={cn(cardClassName, "order-1", LANDING_CARD_CLASS, "lg:[grid-area:time]")}
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
          className={cn(cardClassName, "order-2", LANDING_CARD_CLASS, "lg:[grid-area:sales]")}
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
            "lg:[grid-area:consistency]",
          )}
        >
          <ImageBottomBlock
            number={block3.number}
            title={block3.title}
            description={block3.description}
            image={block3.image}
            width={block3.imageWidth}
            height={block3.imageHeight}
          />
        </li>

        <li
          data-animate-card
          className={cn(cardClassName, "order-4", LANDING_CARD_CLASS, "lg:[grid-area:visual]")}
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
          className={cn(cardClassName, "order-5", LANDING_CARD_CLASS, "lg:[grid-area:cta]")}
        >
          <ImageRightBlock
            number={block5.number}
            title={block5.title}
            description={block5.description}
            image={block5.image}
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
            "sm:col-span-2 lg:[grid-area:human] lg:min-h-56 xl:min-h-64",
          )}
        >
          <ImageLeftBlock
            number={block6.number}
            title={block6.title}
            description={block6.description}
            image={block6.image}
            width={block6.imageWidth}
            height={block6.imageHeight}
          />
        </li>
      </ul>
    </LandingSection>
  );
};

export default Benefits;
