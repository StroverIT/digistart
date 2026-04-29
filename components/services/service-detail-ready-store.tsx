"use client";

import { useState } from "react";
import TransitionLink from "@/components/transitions/TransitionLink";
import { Price } from "@/components/ui/price";
import {
  ArrowRight,
  CheckCircle2,
  CircleX,
  ClipboardList,
  MonitorCheck,
  Rocket,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { addToCart, CART_DUPLICATE_SERVICE_MESSAGE } from "@/lib/store/cart";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { ServiceBuySection } from "@/components/services/service-buy-section";
import { getServiceById } from "@/lib/data/services";
import type { CartItemUpsell, Service } from "@/lib/types";
import { Faq, type FaqItem } from "@/components/ui/faq";

const SERVICE_ID = "ready-store";
const OPTION_ID = "standard";
const PAIN_POINTS = [
  {
    title: "Ограничен си географски",
    text: "Ако продаваш само на място, клиентите ти са само хората от твоя град или квартал. Изпускаш хиляди купувачи от цялата страна.",
  },
  {
    title: "Изпускаш продажби, докато спиш",
    text: "Голяма част от хората пазаруват вечер след работа или през уикендите. Ако нямаш онлайн магазин, тези пари отиват при конкуренцията.",
  },
  {
    title: "Губиш време в чатове",
    text: "Продажбите само през съобщения във Facebook и Instagram са бавни, объркващи и изискват твоето постоянно внимание. Магазинът автоматизира всичко това.",
  },
] as const;

const SOLUTION_ITEMS = [
  "Индивидуален дизайн: Модерна визия, съобразена с твоя бранд, която вдъхва доверие и стимулира покупките.",
  "Мобилна версия (Responsive): Магазинът изглежда и работи перфектно на всяко мобилно устройство.",
  "Методи за плащане: Настройка на наложен платеж, банков път или интеграция за плащане с карта (Stripe/MyPOS).",
  "Лесен панел за управление: Добавяш продукти, променяш цени и следиш поръчки без сложни кодове.",
  "Качване на първоначални продукти: Качваме първите ти продукти (например до 20 бр.), за да стартираш веднага.",
  "Интеграция с куриери (Еконт / Спиди): Подготовка за лесно генериране на товарителници директно от системата.",
  "Безплатен SSL сертификат: Сигурна връзка и доверие за всеки посетител.",
  "Безплатен хостинг за 1 година: Стартираш без допълнителни разходи още от първия ден.",
] as const;

const STEPS = [
  {
    title: "Стъпка 1: Поръчка онлайн",
    body: "Избираш пакета и плащаш бързо и сигурно през нашия сайт. Цената е ясна и крайна - без скрити такси за разработка.",
    icon: ShoppingCart,
  },
  {
    title: "Стъпка 2: Демо версия за преглед",
    body: "Изработваме магазина и ти показваме работна версия. Правим нужните конфигурации според твоите специфични нужди.",
    icon: MonitorCheck,
  },
  {
    title: "Стъпка 3: Готов за продажби",
    body: "Магазинът е онлайн. Системата е тествана, клиентите могат да добавят в количката, а ти започваш да получаваш първите си поръчки.",
    icon: Rocket,
  },
] as const;

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Колко време отнема изработката на онлайн магазина?",
    answer:
      "Стандартната изработка на онлайн магазин отнема между 5 и 6 работни дни след като получим материалите от твоя страна. Процесът е структуриран така, че да стартираш продажбите си максимално бързо.",
  },
  {
    question: "Какви продукти мога да продавам в магазина?",
    answer:
      "Почти всичко! От физически стоки (дрехи, козметика, техника, ръчно изработени артикули) до дигитални продукти (електронни книги, софтуер, курсове). Системата, която изграждаме, е достатъчно гъвкава, за да поеме всякакъв тип инвентар.",
  },
  {
    question: 'Колко продукта включва първоначалната изработка?',
    answer:
      'Пакетът "Онлайн Магазин" включва качването на първите 20 продукта от наша страна (със снимки, описания и цени, предоставени от теб), за да имаш напълно завършен вид при старта. След това можеш да качваш неограничен брой продукти сам, или да използваш нашата добавка за масово качване.',
  },
  {
    question: "Трудно ли е да добавям нови продукти и да променям цени?",
    answer:
      'Не. Ще разполагаш с удобен административен панел (на български език). Добавянето на нов продукт е толкова лесно, колкото да публикуваш снимка във Facebook - просто въвеждаш име, цена, качваш снимка и натискаш "Запази".',
  },
  {
    question: "Как клиентите ще плащат за поръчките си?",
    answer:
      "Магазинът ти ще бъде готов за най-популярния метод в България - Наложен платеж (плащане при доставка). Ако искаш да приемаш плащания с дебитни/кредитни карти, Apple Pay или Google Pay, можем да интегрираме сигурна система (виж комбинирания ни ПРО пакет в добавките при плащане).",
  },
  {
    question: "Трябва ли ръчно да пиша товарителници за Еконт и Спиди?",
    answer:
      'Ако избереш нашата добавка "Интеграция с куриери", отговорът е твърдо НЕ. Системата автоматично ще изчислява цената за доставка на клиента, а ти ще можеш да генерираш и принтираш готова товарителница само с 1 клик директно от админ панела на магазина. Това спестява часове работа всеки ден!',
  },
  {
    question: "Магазинът ще бъде ли съобразен с изискванията на КЗП и GDPR?",
    answer:
      'Да имаш Общи условия и Политика за поверителност е задължително по закон. Можеш да предоставиш свои собствени текстове, които ние да качим, или да избереш нашия "Правен пакет за Електронна Търговия", който включва готови стандартни шаблони, които само да попълниш с данните на твоята фирма.',
  },
  {
    question: "Какво се случва, ако някой добави продукт в количката, но не плати?",
    answer:
      'Това се нарича "изоставена количка" и е често срещано. Ако искаш да спасиш тези продажби, предлагаме автоматизирана система, която изпраща напомнящ имейл на клиента (например: "Забравихте нещо в количката си! Ето 5% отстъпка, за да завършите поръчката").',
  },
  {
    question: "Магазинът ми готов ли е за реклама във Facebook и Instagram?",
    answer:
      "Да! При стартирането на магазина ние се грижим базовата структура да е отлична. За да имаш обаче максимална възвръщаемост от рекламите, препоръчваме да инсталираме Facebook Pixel и Google Analytics (чрез нашите добавки), за да можеш да проследяваш точно коя реклама ти носи продажби.",
  },
] as const;


interface ServiceDetailReadyStoreProps {
  headingFontClass?: string;
  bodyFontClass?: string;
  className?: string;
  serviceData?: Service;
}

export function ServiceDetailReadyStore({
  headingFontClass,
  bodyFontClass,
  className,
  serviceData,
}: ServiceDetailReadyStoreProps) {
  const service = serviceData ?? getServiceById(SERVICE_ID);
  const { push } = useTransitionRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [upsells, setUpsells] = useState<CartItemUpsell[]>([]);

  if (!service) return null;

  const total = 499;

  const scrollToBuySection = () => {
    document.getElementById("buy-now")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCheckout = () => {
    setIsAdding(true);
    const result = addToCart(SERVICE_ID, OPTION_ID, upsells);
    if (!result.added) {
      setIsAdding(false);
      if (result.reason === "duplicate") {
        toast(CART_DUPLICATE_SERVICE_MESSAGE);
      }
      return;
    }
    setTimeout(() => {
      setIsAdding(false);
      push("/cart");
    }, 250);
  };

  return (
    <div
      className={cn(
        "pt-20 pb-28 md:pb-16",
        bodyFontClass,
        className
      )}
    >
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
            href="/#services"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            Към услугите
          </TransitionLink>

          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <ShoppingCart className="h-4 w-4" />
              Продавай 24/7 без ограничения
            </span>
            <h1
              className={cn(
                headingFontClass,
                "mt-6 text-4xl sm:text-5xl leading-tight text-balance"
              )}
            >
              Готов Онлайн Магазин
              <div className="gradient-text">Твоят бизнес, отворен денонощно</div>
            </h1>
            <p className="mt-5 max-w-3xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Излез на онлайн пазара бързо и без стрес. Получаваш професионален, напълно
              функциониращ електронен магазин на фиксирана цена. Ти осигуряваш продуктите, ние се
              грижим за всичко останало.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <Price
                value={total}
                className={cn(
                  headingFontClass,
                  "text-3xl sm:text-4xl text-primary"
                )}
              />
              <button
                type="button"
                onClick={scrollToBuySection}
                className="h-14 px-8 text-lg rounded-xl bg-orange-500 hover:bg-orange-600 text-white inline-flex items-center justify-center font-semibold"
              >
                Купи сега
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
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
            <h2 className={cn(headingFontClass, "text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance")}>
              Защо губиш пари всеки ден без онлайн магазин?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Физическият обект има работно време. Твоят сайт - не.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {PAIN_POINTS.map((item) => (
              <div
                key={item.title}
                className="group bg-card border border-border hover:border-destructive/50 rounded-xl transition-all duration-300"
              >
                <div className="p-6 md:p-7">
                  <CircleX className="h-5 w-5 text-red-500 mb-4" />
                  <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              </div>
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
            <h2 className={cn(headingFontClass, "text-3xl sm:text-4xl md:text-5xl font-bold text-balance")}>
              Какво е включено в пакета "Онлайн Магазин"?
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {SOLUTION_ITEMS.map((item) => (
              <div
                key={item}
                className="group border border-border bg-card hover:border-primary/50 transition-all duration-300 rounded-xl"
              >
                <div className="p-5 md:p-6 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">{item}</p>
                </div>
              </div>
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
            <h2 className={cn(headingFontClass, "text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance")}>
              Как да стартираш продажбите? (Само 3 лесни стъпки)
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Процесът е оптимизиран, за да започнеш да печелиш възможно най-бързо.
            </p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-border to-transparent -translate-y-1/2" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {STEPS.map((step, index) => (
                <div key={step.title} className="relative">
                  <div className="group bg-card border border-border hover:border-primary/50 transition-colors h-full rounded-xl">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <step.icon className="h-5 w-5" />
                        </div>
                        <span className="text-3xl font-bold text-muted-foreground/30">
                          0{index + 1}
                        </span>
                        <ClipboardList className="ml-auto h-5 w-5 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
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

      <section className="py-16 md:py-20 bg-card/40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-3 block">FAQ</span>
            <h2 className={cn(headingFontClass, "text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance")}>
              Често задавани въпроси
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Всичко важно, което най-често ни питат преди старт на онлайн магазин.
            </p>
          </div>
          <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card px-5 py-2 sm:px-8 sm:py-4">
            <Faq items={FAQ_ITEMS} />
          </div>
        </div>
      </section>

      {service ? (
        <ServiceBuySection
          service={service}
          title="Купи сега"
          description="Конфигурирай магазина и го добави в кошницата."
          price={total}
          upsells={upsells}
          onUpsellsChange={setUpsells}
          onAddToCart={handleCheckout}
          isAdding={isAdding}
        />
      ) : null}

      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur px-4 py-3">
        <div className="mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Пакет "Онлайн Магазин"</p>
            <Price value={total} className={cn(headingFontClass, "font-semibold")} />
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isAdding}
            className="min-h-11 min-w-30 shrink-0 rounded-lg bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-70"
          >
            {isAdding ? "Добавяне..." : "Добави в кошницата"}
          </button>
        </div>
      </div>
    </div>
  );
}
