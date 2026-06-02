import Image from "next/image";
import { ClipboardList, LineChart, Package, Users } from "lucide-react";
import { LandingSection, LandingSectionTitle } from "./shared";

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
      <LandingSectionTitle as="h1" className="max-w-4xl mx-auto">
        Едно табло за управление, пълен контрол и лесно управление на онлайн магазина ти
      </LandingSectionTitle>

      <ul className="mt-12 grid gap-5 sm:grid-cols-2">
        {adminFeatures.map((feature) => (
          <li
            key={feature.title}
            className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm sm:p-8"
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

      <div className="relative mx-auto mt-14 aspect-[16/10] w-full max-w-5xl overflow-hidden rounded-2xl border border-border/80 bg-muted/20 shadow-xl">
        <Image
          src="/admin-panel.png"
          alt="Admin Panel"
          fill
          className="object-contain p-4 sm:p-6"
          sizes="(max-width: 1280px) 100vw, 1024px"
        />
      </div>
    </LandingSection>
  );
};

export default AdminPanel;
