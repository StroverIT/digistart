"use client";

import { useState } from "react";
import {
  CheckCircle2,
  CircleX,
  ClipboardList,
  MessageCircle,
  MonitorCheck,
  Phone,
  Rocket,
  ShoppingCart,
  Zap,
} from "lucide-react";
import TransitionLink from "@/components/transitions/TransitionLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { addToCart } from "@/lib/store/cart";
import { getServiceById } from "@/lib/data/services";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";

const service = getServiceById("websites");

const painPoints = [
  {
    title: "Губиш доверие",
    text: "В днешно време, ако клиентите не могат да те намерят в интернет, те просто не вярват, че бизнесът ти е легитимен.",
  },
  {
    title: "Изпускаш топли клиенти",
    text: "Хората търсят твоите услуги в Google точно в този момент. Щом нямаш сайт, те намират конкуренцията ти и плащат на нея.",
  },
  {
    title: "Работиш по-трудно",
    text: "Сайтът е твоят виртуален търговец, който работи 24/7. Без него трябва да обясняваш едно и също нещо по телефона стотици пъти.",
  },
] as const;

const solutionItems = [
  "Индивидуален дизайн: Съобразен изцяло с твоя бранд, лого и цветове.",
  "Перфектна мобилна версия: Сайтът ще изглежда безупречно на всеки телефон и таблет.",
  "Основни страници: Всичко необходимо (Начало, За нас, Услуги, Контакти, Галерия).",
  "Базова SEO оптимизация: Техническа готовност сайтът ти да бъде четен правилно от Google.",
  "Форми за контакт и карта: Клиентите лесно изпращат запитвания и те намират.",
  "Бързо зареждане: Изграден с модерни технологии за светкавична скорост.",
] as const;

const steps = [
  {
    title: "Стъпка 1: Поръчка онлайн",
    text: "Избираш пакета и плащаш бързо и сигурно през нашия сайт. Цената е фиксирана - край на изненадите!",
    icon: ShoppingCart,
  },
  {
    title: "Стъпка 2: Кратка консултация (до 15 мин)",
    text: "Свързваме се с теб за бърз разговор. Уточняваме визията, цветовете и нуждите на бизнеса.",
    icon: Phone,
  },
  {
    title: "Стъпка 3: Демо версия за преглед",
    text: "Изработваме работна версия. Преглеждаш я и правим конфигурации, докато пасне идеално.",
    icon: MonitorCheck,
  },
  {
    title: "Стъпка 4: Готов уебсайт онлайн",
    text: "Качваме сайта на реален домейн и той започва да работи за теб веднага.",
    icon: Rocket,
  },
] as const;

export function ServiceDetailWebsite() {
  const { push } = useTransitionRouter();
  const [isAdding, setIsAdding] = useState(false);

  if (!service) return null;

  const selectedOption = service.options[0];

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(service.id, selectedOption.id, []);

    setTimeout(() => {
      setIsAdding(false);
      push("/кошница");
    }, 300);
  };

  return (
    <div className="pt-24 pb-28 md:pb-16">
      <div className="container mx-auto px-4">
        <TransitionLink
          href="/#услуги"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          Към услугите
        </TransitionLink>

        <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 md:p-12">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-sm font-medium">
              <Zap className="h-4 w-4" />
              Бързо, лесно и на ясна цена
            </span>
            <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-bold text-balance">
              Твоят професионален уебсайт. Готов за броени дни.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Спри да губиш клиенти, защото те няма онлайн. Представи бизнеса си с модерен сайт
              на предварително фиксирана цена. Без скрити такси, без чакане с месеци.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-4">
              <p className="text-3xl font-bold text-primary">{selectedOption.price} лв.</p>
              <Button
                onClick={handleAddToCart}
                size="lg"
                disabled={isAdding}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isAdding ? "Добавяне..." : "Поръчай своя сайт сега"}
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Защо бизнесът ти има нужда от уебсайт точно сега?
          </h2>
          <p className="text-muted-foreground mb-6">
            Всеки ден без сайт е подарен клиент на конкуренцията.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {painPoints.map((item) => (
              <Card key={item.title} className="border-border">
                <CardContent className="p-6">
                  <CircleX className="h-5 w-5 text-red-500 mb-3" />
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Какво е включено в пакета?</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {solutionItems.map((item) => (
              <Card key={item} className="border-border">
                <CardContent className="p-5 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-muted-foreground">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Как да започнем? (Само 4 лесни стъпки)
          </h2>
          <p className="text-muted-foreground mb-6">
            Направихме процеса максимално бърз, за да не губиш време.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {steps.map((step) => (
              <Card key={step.title} className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <step.icon className="h-6 w-6 text-primary" />
                    <ClipboardList className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-xl border border-border bg-card p-5 sm:p-6">
          <p className="text-sm sm:text-base flex items-start gap-2 text-muted-foreground">
            <MessageCircle className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
            Цената е фиксирана и прозрачна. Получаваш ясна рамка, бърз процес и сайт, който е
            готов да работи за бизнеса ти.
          </p>
        </section>
      </div>

      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur px-4 py-3">
        <div className="mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Пакет "Уебсайт"</p>
            <p className="font-semibold">{selectedOption.price} лв.</p>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isAdding ? "Добавяне..." : "Започни сега"}
          </Button>
        </div>
      </div>
    </div>
  );
}
