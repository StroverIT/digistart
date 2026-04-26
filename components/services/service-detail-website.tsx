"use client";

import { useState } from "react";
import {
  ArrowRight,
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
import { Price } from "@/components/ui/price";
import { addToCart } from "@/lib/store/cart";
import { getServiceById } from "@/lib/data/services";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { cn } from "@/lib/utils";

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

interface ServiceDetailWebsiteProps {
  headingFontClass?: string;
  bodyFontClass?: string;
  className?: string;
}

export function ServiceDetailWebsite({
  headingFontClass,
  bodyFontClass,
  className,
}: ServiceDetailWebsiteProps) {
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
    <div className={cn("pt-20 pb-28 md:pb-16", bodyFontClass, className)}>
      <section className="relative overflow-hidden pt-10 pb-14 md:pt-14 md:pb-18">
        <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl animate-pulse delay-1000" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="container relative z-10 mx-auto px-4">
          <TransitionLink
            href="/#услуги"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            Към услугите
          </TransitionLink>

          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              Бързо, лесно и на ясна цена
            </span>
            <h1
              className={cn(
                headingFontClass,
                "mt-6 text-4xl sm:text-5xl leading-tight text-balance"
              )}
            >
              Твоят професионален уебсайт <div className="gradient-text">Готов за броени дни</div>
            </h1>
            <p className="mt-5 max-w-3xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Спри да губиш клиенти, защото те няма онлайн. Представи бизнеса си с модерен сайт
              на предварително фиксирана цена. Без скрити такси, без чакане с месеци.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <Price value={selectedOption.price} className="text-3xl sm:text-4xl text-primary" />
              <Button
                onClick={handleAddToCart}
                size="lg"
                disabled={isAdding}
                className="h-14 px-8 text-lg bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isAdding ? "Добавяне..." : "Поръчай своя сайт сега"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-3 block">
              Проблемът
            </span>
            <h2
              className={cn(
                headingFontClass,
                "text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance"
              )}
            >
              Защо бизнесът ти има нужда от уебсайт точно сега?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Всеки ден без сайт е подарен клиент на конкуренцията.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {painPoints.map((item) => (
              <Card
                key={item.title}
                className="group bg-card border-border hover:border-destructive/50 transition-all duration-300"
              >
                <CardContent className="p-6 md:p-7">
                  <CircleX className="h-5 w-5 text-red-500 mb-4" />
                  <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-3 block">
              Решението
            </span>
            <h2
              className={cn(
                headingFontClass,
                "text-3xl sm:text-4xl md:text-5xl font-bold text-balance"
              )}
            >
              Какво е включено в пакета?
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {solutionItems.map((item) => (
              <Card
                key={item}
                className="group border-border bg-card hover:border-primary/50 transition-all duration-300"
              >
                <CardContent className="p-5 md:p-6 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-3 block">
              Процес
            </span>
            <h2
              className={cn(
                headingFontClass,
                "text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance"
              )}
            >
              Как да започнем? (Само 4 лесни стъпки)
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Направихме процеса максимално бърз, за да не губиш време.
            </p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-border to-transparent -translate-y-1/2" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <div key={step.title} className="relative">
                  <Card className="group bg-card border-border hover:border-primary/50 transition-colors h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <step.icon className="h-5 w-5" />
                        </div>
                        <span className="text-3xl font-bold text-muted-foreground/30">0{index + 1}</span>
                        <ClipboardList className="ml-auto h-5 w-5 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
                    </CardContent>
                  </Card>
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center my-4">
                      <div className="h-8 w-0.5 bg-border" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-8 md:pb-12">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <p className="text-sm sm:text-base flex items-start gap-2 text-muted-foreground">
              <MessageCircle className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              Цената е фиксирана и прозрачна. Получаваш ясна рамка, бърз процес и сайт, който е
              готов да работи за бизнеса ти.
            </p>
          </div>
        </div>
      </section>

      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur px-4 py-3">
        <div className="mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Пакет "Уебсайт"</p>
            <Price value={selectedOption.price} className="font-semibold" />
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="min-h-11 min-w-30 shrink-0 px-4 text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isAdding ? "Добавяне..." : "Започни сега"}
          </Button>
        </div>
      </div>
    </div>
  );
}
