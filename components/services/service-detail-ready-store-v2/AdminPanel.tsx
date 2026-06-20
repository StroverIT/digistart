"use client";

import { useRef } from "react";
import Image from "next/image";
import { ClipboardList, LineChart, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingSection } from "./shared";
import { LANDING_REVEAL_CLASS, LANDING_CARD_CLASS } from "./landing-animation-classes";
import { useLandingScrollAnimations } from "./use-landing-scroll-animations";

const adminFeatures = [
  {
    icon: ClipboardList,
    title: "Обработка на поръчки",
    description:
      "Управлявай всяка стъпка от поръчките си - от преглед и приемане на плащания до откази и възстановяване на суми.",
  },
  {
    icon: Users,
    title: "Управление на клиенти",
    description:
      "Разглеждай детайлно клиентските профили, проследявай индивидуалната история на покупките и организирай базата си с контакти на едно място.",
  },
  {
    icon: Package,
    title: "Управление на наличности",
    description:
      "Следи количествата на склад в реално време, управлявай продуктовия си каталог и откривай кои артикули са най-печеливши.",
  },
  {
    icon: LineChart,
    title: "Анализ на данните",
    description:
      "Следи в реално време как адаптираме магазина ти и използвай данните за потребителското поведение за по-успешни маркетинг кампании.",
  },
] as const;

const AdminPanel = () => {
  const sectionRef = useRef<HTMLElement>(null);
  useLandingScrollAnimations(sectionRef, { staggerReveal: 0.1, staggerCard: 0.12 });

  return (
    <LandingSection ref={sectionRef} id="admin" className="pb-0!">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 lg:gap-12">
        <h1
          data-animate-reveal
          className={`max-w-3xl font-heading text-2xl font-bold tracking-tight text-foreground md:max-w-lg lg:leading-tight ${LANDING_REVEAL_CLASS}`}
        >
          Едно табло, пълен контрол и лесно управление на онлайн магазина ти
        </h1>
        <div data-animate-reveal className={LANDING_REVEAL_CLASS}>
          <Button
            asChild
            size="sm"
            className="shrink-0 self-center rounded-full px-8 text-sm font-semibold shadow-lg shadow-primary/20"
          >
            <a href="#buy-now">Започни сега</a>
          </Button>
        </div>
      </div>

      <ul className="mt-12 grid list-none gap-10 p-0 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-0">
        {adminFeatures.map((feature) => (
          <li
            key={feature.title}
            data-animate-card
            className={`flex flex-col lg:border-l lg:px-10 ${LANDING_CARD_CLASS}`}
          >
            <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <feature.icon className="size-5" aria-hidden />
            </span>
            <h2 className="font-heading text-sm font-bold">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-xs">
              {feature.description}
            </p>
          </li>
        ))}
      </ul>

      <div
        data-animate-card
        className={`relative mx-auto aspect-[16/10] w-full max-w-6xl ${LANDING_CARD_CLASS}`}
      >
        <div className="glow-blob blob-left"></div>
        <div className="glow-blob blob-right"></div>

        <div className="relative z-10 h-full w-full rounded-3xl md:-mt-22 lg:-mt-38">
          <Image
            src="/dashboard.webp"
            alt="Admin Panel"
            fill
            className="object-contain object-bottom"
            sizes="(max-width: 1280px) 100vw, 1152px"
            loading="lazy"
          />
        </div>
      </div>
    </LandingSection>
  );
};

export default AdminPanel;
