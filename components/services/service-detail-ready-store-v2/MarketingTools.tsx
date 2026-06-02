import {
  BarChart3,
  Mail,
  Percent,
  Search,
  Star,
  Target,
} from "lucide-react";
import { LandingSection, LandingSectionTitle } from "./shared";

const tools = [
  {
    icon: Target,
    title: "Вграден пиксел",
    description: "Готов за реклама от първата минута",
  },
  {
    icon: BarChart3,
    title: "Digi Analytics",
    description: "Наши системи които проследяват клиентите ти за специализирано преживяване",
  },
  {
    icon: Mail,
    title: "Имейл маркетинг",
    description:
      "Събирай автоматично имейлите на клиентите които искат да се запишат за бюлетина. И автоматично пращане на имейли за персонализирани имейли или създаване на кампания",
  },
  {
    icon: Star,
    title: "Ревюта",
    description:
      "При успешно направена поръчка клиентът получава имейл за ревю към google my business. Хората първо там проверяват дали е легитимен бизнеса",
  },
  {
    icon: Percent,
    title: "Промоции и намаления",
    description: "На специфична дата сложи промоция или специфични секции да имат намаление",
  },
  {
    icon: Search,
    title: "SEO оптимизиран",
    description: "Всички секции и продукти са SEO оптимизирани",
  },
] as const;

const MarketingTools = () => {
  return (
    <LandingSection id="marketing" className="bg-muted/30">
      <h1 className="max-w-3xl mx-auto text-4xl text-center">
        Продавай лесно с нашите вградени маркетинг инструменти
      </h1>

      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <li
            key={tool.title}
            className="flex flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8"
          >
            <span className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <tool.icon className="size-6" aria-hidden />
            </span>
            <h2 className="font-heading text-xl font-bold">{tool.title}</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {tool.description}
            </p>
          </li>
        ))}
      </ul>
    </LandingSection>
  );
};

export default MarketingTools;
