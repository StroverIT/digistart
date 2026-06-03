import Image from "next/image";
import { ClipboardList, LineChart, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingSection } from "./shared";

const adminFeatures = [
  {
    icon: ClipboardList,
    title: "Обработка на поръчки",
    description: "Управлявай всяка стъпка от поръчките си - от преглед и приемане на плащания до откази и възстановяване на суми.",
  },
  {
    icon: Users,
    title: "Управление на клиенти",
    description: "Разглеждай детайлно клиентските профили, проследявай индивидуалната история на покупките и организирай базата си с контакти на едно място.",
  },
  {
    icon: Package,
    title: "Управление на наличности",
    description: "Следи количествата на склад в реално време, управлявай продуктовия си каталог и откривай кои артикули са най-печеливши.",
  },
  {
    icon: LineChart,
    title: "Анализ на данните",
    description: "Следи в реално време как адаптираме магазина ти и използвай данните за потребителското поведение за по-успешни маркетинг кампании.",
  }
] as const;

const AdminPanel = () => {
  return (
    <LandingSection id="admin" className="pb-0!">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 lg:gap-12">
        <h1 className="max-w-3xl font-heading text-2xl font-bold tracking-tight text-foreground md:max-w-lg lg:leading-tight">
          Едно табло, пълен контрол и лесно управление на онлайн магазина ти
        </h1>
        <Button
          asChild
          size="sm"
          className="shrink-0 self-center rounded-full px-8 text-sm font-semibold shadow-lg shadow-primary/20"
        >
          <a href="#buy-now">Започни сега</a>
        </Button>
      </div>

      <ul className="mt-12 grid list-none gap-10 p-0 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-0">
        {adminFeatures.map((feature, index) => (
          <li
            key={feature.title}
            className={`flex flex-col lg:border-l lg:px-10`}
          >
            <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <feature.icon className="size-5" aria-hidden />
            </span>
            <h2 className="font-heading text-sm font-bold">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-xs">
              {feature.description}
            </p>
          </li>
        ))}
      </ul>

      <div className="admin-panel-showcase relative mx-auto mt-14 aspect-16/10 w-full rounded-3xl">
        <div
          className="admin-panel-showcase__glow admin-panel-showcase__glow--1"
          aria-hidden
        />
        <div
          className="admin-panel-showcase__glow admin-panel-showcase__glow--2"
          aria-hidden
        />
        <div className="relative z-10 h-full w-full">
          <Image
            src="/dashboard.png"
            alt="Admin Panel"
            fill
            className="object-contain object-bottom"
            sizes="(max-width: 1280px) 100vw, 1152px"
          />
        </div>
      </div>
    </LandingSection>
  );
};

export default AdminPanel;
