import Image from "next/image";
import { ClipboardList, LineChart, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingSection } from "./shared";

const adminFeatures = [
  {
    icon: ClipboardList,
    title: "Обработка на поръчки",
    description: "Приемай и връщай плащания, отказвай поръчки и управлявай поръчките си",
  },
  {
    icon: Users,
    title: "Управление на клиенти",
    description: "Виж информацията на клиентите, следи поведението при покупка и още много други.",
  },
  {
    icon: Package,
    title: "Наблюдавай наличноста на продуктите ",
    description:
      "Виж колко продукти имаш в наличност, кои продукти са най-печеливши и кои секции имат най-висок трафик",
  },
  {
    icon: LineChart,
    title: "Достъп до анализи",
    description:
      "Имаш достъп до анализите които правим за да адаптираме онлайн магазина ти спрямо нуждите на клиентите ти",
  },
] as const;

const AdminPanel = () => {
  return (
    <LandingSection id="admin">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8 lg:gap-12">
        <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-foreground lg:max-w-4xl lg:text-[2.75rem] lg:leading-tight">
          Едно табло за управление, пълен контрол и лесно управление на онлайн магазина ти
        </h1>
        <Button
          asChild
          size="lg"
          className="h-12 shrink-0 self-start rounded-full px-8 text-base font-semibold shadow-lg shadow-primary/20"
        >
          <a href="#buy-now">Започни сега</a>
        </Button>
      </div>

      <ul className="mt-12 grid list-none gap-10 p-0 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-border/80">
        {adminFeatures.map((feature, index) => (
          <li
            key={feature.title}
            className={`flex flex-col lg:px-8 ${index === 0 ? "lg:pl-0" : ""} ${index === adminFeatures.length - 1 ? "lg:pr-0" : ""}`}
          >
            <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <feature.icon className="size-5" aria-hidden />
            </span>
            <h2 className="font-heading text-xl font-bold">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {feature.description}
            </p>
          </li>
        ))}
      </ul>

      <div className="relative mx-auto mt-14 aspect-16/10 w-full overflow-hidden rounded-2xl border border-border/80 bg-muted/20 shadow-xl lg:mt-16">
        <Image
          src="/admin-panel.png"
          alt="Admin Panel"
          fill
          className="object-cover object-top"
          sizes="(max-width: 1280px) 100vw, 1152px"
        />
      </div>
    </LandingSection>
  );
};

export default AdminPanel;
