"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { cartItemToMetaLineItem, trackMetaAddToCart } from "@/lib/analytics/meta-pixel";
import { trackCtaClick } from "@/lib/analytics/tracker";
import { Price } from "@/components/ui/price";
import {
  ArrowUpRight,
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
import { getServiceById, getServicePlanPrice } from "@/lib/data/services";
import type { CartItemUpsell, Service } from "@/lib/types";
import { Faq, type FaqItem } from "@/components/ui/faq";
import Link from "next/link";
import { ServiceDetailHero } from "@/components/services/service-detail-hero";

gsap.registerPlugin(ScrollTrigger);

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
  "Мобилна версия (Responsive): Магазинът изглежда и работи перфектно на всяко устройство, като телефон, таблет и компютър.",
  "Лесен панел за управление: Добавяш продукти, променяш цени и следиш поръчки без сложни кодове.",
  "Качване на първоначални продукти: Качваме първите ти продукти (например до 20 бр.), за да стартираш веднага.",
  "Можеш да добавяш и управляваш до 500 артикула през панела за управление.",
  "Безплатен SSL сертификат: Сигурна връзка и доверие за всеки посетител.",
  "Безплатен хостинг за 1 година: Стартираш без допълнителни разходи още от първия ден.",
  "Безплатна поддръжка и сигурност за един месец: Ще ние се грижим за всичко останало, за да работиш безпроблемно."
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
  const pageRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = pageRootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const sections = root.querySelectorAll<HTMLElement>("[data-animate-section]");
      sections.forEach((section) => {
        const reveals = section.querySelectorAll<HTMLElement>("[data-animate-reveal]");
        const cards = section.querySelectorAll<HTMLElement>("[data-animate-card]");

        if (reveals.length) {
          gsap.set(reveals, { opacity: 0, y: 40 });
          gsap.to(reveals, {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.1,
            ease: "back.out(1.6)",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          });
        }

        if (cards.length) {
          gsap.set(cards, { opacity: 0, y: 50, scale: 0.95 });
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          });
        }
      });
    }, root);

    return () => ctx.revert();
  }, []);

  if (!service) return null;

  const planPrice = getServicePlanPrice(service, OPTION_ID);

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
    const addedItem = result.cart.items.find(
      (i) => i.serviceId === SERVICE_ID && i.selectedOptionId === OPTION_ID,
    );
    if (addedItem) {
      trackMetaAddToCart([cartItemToMetaLineItem(addedItem)], { page_path: "/services/online-store" });
    }
    setTimeout(() => {
      setIsAdding(false);
      push("/cart");
    }, 250);
  };

  return (
    <div
      ref={pageRootRef}
      className={cn(
        "pt-16 pb-12 md:pt-20 md:pb-16",
        bodyFontClass,
        className
      )}
    >
      <ServiceDetailHero
        badgeIcon={<ShoppingCart className="h-4 w-4" />}
        badgeText="Продавай 24/7 без ограничения"
        title={
          <>
            Готов Онлайн Магазин
            <div className="gradient-text">Твоят бизнес, отворен денонощно</div>
          </>
        }
        description={
          <>
            Излез на онлайн пазара бързо и без стрес. Получаваш професионален, напълно
            функциониращ електронен магазин на фиксирана цена. Ти осигуряваш продуктите, ние се
            грижим за всичко останало.
          </>
        }
        priceSlot={
          <Price
            value={planPrice}
            className={cn(
              headingFontClass,
              "text-3xl sm:text-4xl text-primary"
            )}
          />
        }
        primaryLabel="Купи сега"
        onPrimaryClick={() => {
          trackCtaClick("/services/online-store", "service_ready_store_scroll_to_buy");
          scrollToBuySection();
        }}
        backCtaId="service_ready_store_back_to_services"
        headingFontClass={headingFontClass}
      />

      <section data-animate-section className="py-8 md:py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
            <span
              data-animate-reveal
              className="text-primary font-semibold text-sm uppercase tracking-wider mb-3 block opacity-0 translate-y-10"
            >
              Проблемът
            </span>
            <h2
              data-animate-reveal
              className={cn(
                headingFontClass,
                "text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance opacity-0 translate-y-10",
              )}
            >
              Защо губиш пари всеки ден без онлайн магазин?
            </h2>
            <p
              data-animate-reveal
              className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
            >
              Физическият обект има работно време. Твоят сайт - не.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {PAIN_POINTS.map((item) => (
              <div
                key={item.title}
                data-animate-card
                className="group bg-card border border-border hover:border-destructive/50 rounded-xl transition-all duration-300 opacity-0 translate-y-10"
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

      <section data-animate-section className="py-8 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
            <span
              data-animate-reveal
              className="text-primary font-semibold text-sm uppercase tracking-wider mb-3 block opacity-0 translate-y-10"
            >
              Решението
            </span>
            <h2
              data-animate-reveal
              className={cn(
                headingFontClass,
                "text-3xl sm:text-4xl md:text-5xl font-bold text-balance opacity-0 translate-y-10",
              )}
            >
              Какво е включено в пакета "Онлайн Магазин"?
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {SOLUTION_ITEMS.map((item) => (
              <div
                key={item}
                data-animate-card
                className="group border border-border bg-card hover:border-primary/50 transition-all duration-300 rounded-xl opacity-0 translate-y-10"
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

      <section data-animate-section className="py-8 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
            <span
              data-animate-reveal
              className="text-primary font-semibold text-sm uppercase tracking-wider mb-3 block opacity-0 translate-y-10"
            >
              Процес
            </span>
            <h2
              data-animate-reveal
              className={cn(
                headingFontClass,
                "text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance opacity-0 translate-y-10",
              )}
            >
              Как да стартираш продажбите? (Само 3 лесни стъпки)
            </h2>
            <p
              data-animate-reveal
              className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
            >
              Процесът е оптимизиран, за да започнеш да печелиш възможно най-бързо.
            </p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-border to-transparent -translate-y-1/2" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {STEPS.map((step, index) => (
                <div key={step.title} className="relative">
                  <div
                    data-animate-card
                    className="group bg-card border border-border hover:border-primary/50 transition-colors h-full rounded-xl opacity-0 translate-y-10"
                  >
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

      <section data-animate-section className="py-8 md:py-20 border-y border-border/70 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="mb-8 md:mb-12 text-center max-w-3xl mx-auto">
            <span
              data-animate-reveal
              className="text-primary font-semibold text-sm uppercase tracking-wider mb-3 block opacity-0 translate-y-10"
            >
              Казус
            </span>
            <h2
              data-animate-reveal
              className={cn(
                headingFontClass,
                "text-3xl sm:text-4xl md:text-5xl font-bold text-balance opacity-0 translate-y-10",
              )}
            >
              Как изглежда това в реален бизнес?
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div
              data-animate-card
              className="relative w-full aspect-4/3 overflow-hidden rounded-lg opacity-0 translate-y-10"
            >
              <Image
                src="/what-we-offer/restyled-mock-up.png"
                alt="Restyled case study"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div data-animate-reveal className="opacity-0 translate-y-10">
                <span className="text-xs sm:text-sm font-medium tracking-widest uppercase text-muted-foreground mb-2 block">
                  Онлайн магазин
                </span>
                <h3 className={cn(headingFontClass, "text-2xl sm:text-3xl md:text-4xl mb-4 text-balance")}>
                  Restyled
                </h3>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                  Реален пример как добре структуриран онлайн магазин помага на бранд да продава
                  по-лесно, да представя продуктите си професионално и да увеличава поръчките.
                </p>
              </div>

              <div
                data-animate-reveal
                className="grid grid-cols-2 gap-6 sm:gap-8 opacity-0 translate-y-10"
              >
                <div>
                  <p className={cn(headingFontClass, "text-2xl sm:text-3xl md:text-4xl mb-1")}>Fashion</p>
                  <p className="text-muted-foreground text-sm sm:text-base">Ниша</p>
                </div>
                <div>
                  <p className={cn(headingFontClass, "text-2xl sm:text-3xl md:text-4xl mb-1")}>Mobile-first</p>
                  <p className="text-muted-foreground text-sm sm:text-base">Фокус</p>
                </div>
              </div>

              <Link
                data-animate-reveal
                href="https://restyled.bg"
                className="inline-flex items-center gap-2 text-primary text-base sm:text-lg font-medium group opacity-0 translate-y-10"
              >
                Виж онлайн магазина
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section data-animate-section className="py-8 md:py-20 bg-card/40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
            <span
              data-animate-reveal
              className="text-primary font-semibold text-sm uppercase tracking-wider mb-3 block opacity-0 translate-y-10"
            >
              FAQ
            </span>
            <h2
              data-animate-reveal
              className={cn(
                headingFontClass,
                "text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance opacity-0 translate-y-10",
              )}
            >
              Често задавани въпроси
            </h2>
            <p
              data-animate-reveal
              className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
            >
              Всичко важно, което най-често ни питат преди старт на онлайн магазин.
            </p>
          </div>
          <div
            data-animate-card
            className="mx-auto max-w-4xl rounded-2xl border border-border bg-card px-5 py-2 sm:px-8 sm:py-4 opacity-0 translate-y-10"
          >
            <Faq items={FAQ_ITEMS} />
          </div>
        </div>
      </section>

      {service ? (
        <ServiceBuySection
          service={service}
          title="Купи сега"
          description="Конфигурирай магазина и го добави в кошницата."
          price={planPrice}
          upsells={upsells}
          onUpsellsChange={setUpsells}
          onAddToCart={handleCheckout}
          isAdding={isAdding}
          ctaId="service_ready_store_buy_section_add_to_cart"
          ctaPage="/services/online-store"
        />
      ) : null}

    </div>
  );
}
