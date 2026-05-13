"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CheckCircle2,
  CircleX,
  ClipboardList,
  MonitorCheck,
  Rocket,
  ShoppingCart,
  Smartphone,
} from "lucide-react";
import {
  cartItemToMetaLineItem,
  trackMetaAddToCart,
} from "@/lib/analytics/meta-pixel";
import { trackCtaClick } from "@/lib/analytics/tracker";
import { Card, CardContent } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { addToCart, CART_DUPLICATE_SERVICE_MESSAGE } from "@/lib/store/cart";
import { toast } from "sonner";
import type { CartItemUpsell, Service } from "@/lib/types";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { ServiceBuySection } from "@/components/services/service-buy-section";
import { getServicePlanPrice } from "@/lib/data/services";
import { Faq, type FaqItem } from "@/components/ui/faq";
import { ServiceDetailHero } from "@/components/services/service-detail-hero";
import { ServicePageBackground } from "@/components/services/service-page-background";

gsap.registerPlugin(ScrollTrigger);

const marketingPainPoints = [
  {
    title: "Промоциите ти остават тайни",
    text: "Правиш голямо намаление в магазина, но почти никой не разбира за него. Рекламите могат да достигнат до десетки хиляди в града ти за дни.",
  },
  {
    title: 'Чакаш само "от уста на уста"',
    text: "Разчиташ единствено на случайни препоръки, което спира растежа ти. Губиш клиенти, защото не достигаш проактивно до нови аудитории чрез социалните мрежи.",
  },
  {
    title: 'Губиш "зяпачите" завинаги',
    text: "Хората влизат, разглеждат и си тръгват (window shoppers), без да купят нищо. Ако нямаш реклами за ретаргетиране, губиш възможността да ги върнеш със специален код за отстъпка.",
  },
  {
    title: "Хвърляш пари на сляпо",
    text: "Плащаш за флаери, но не знаеш колко от хората, които са ги взели, реално са купили нещо. Дигиталната реклама проследява всяка продажба чрез Facebook/Google Pixel.",
  },
  {
    title: "Липсва ти изградено доверие",
    text: "Потребителите търсят история, доверие и автентичност, но над 70% от бизнесите изобщо нямат ресурс за създаване на съдържание.",
  },
  {
    title: "Принуден си да сваляш цените",
    text: 'Клиентите стават все по-чувствителни към цената, когато брандът ти не е видим. Маркетингът ти позволява да продаваш стойност и "пакети", а не най-ниската цена.',
  },
] as const;

const marketingSolutionItems = [
  "Органично съдържание (Meta или TikTok): Създаване и публикуване на ангажиращи постове, carousels, сторита и Reels 3 пъти седмично за един канал по твой избор.",
  "Професионален Copywriting & Дизайн: Продаващи текстове и визии, съобразени с бранда и актуалните трендове.",
  "Месечен план (Content Calendar): Ясен график какво, кога и къде ще бъде публикувано.",
  "Анализ и отчет: Всеки месец получаваш ясна справка за нови клиенти, продажби и растеж на профилите.",
  "Седмична безплатна консултация: Всяка седмица една среща за ъпгрейд, мащабиране и откриване на пропуски, които могат да бъдат попълнени.",
] as const;

const marketingSteps = [
  {
    title: "Стъпка 1: Поръчка онлайн",
    text: "Избираш маркетинговия пакет и плащаш еднократно за първоначалната настройка.",
    icon: ShoppingCart,
  },
  {
    title: "Стъпка 2: Демо версия на стратегията",
    text: "Изготвяме първоначален месечен план за постове, текстове, Reels идеи и рекламни стратегии за преглед и одобрение.",
    icon: MonitorCheck,
  },
  {
    title: "Стъпка 3: Всичко е активно",
    text: "Стартираме органичното съдържание и платените реклами. Профилите ти започват да работят за теб 24/7.",
    icon: Rocket,
  },
] as const;

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "1. Бюджетът за реклама включен ли е в месечната такса?",
    answer:
      "Не. Месечният абонамент към нас покрива нашия труд - писането на текстове, правенето на дизайни, техническата настройка и ежедневното управление на твоите реклами. Самият бюджет за реклама (парите, които плащаш директно на Facebook, Instagram, Google или TikTok) се определя от теб и се тегли от твоята банкова карта. Ние ще те консултираме какъв е оптималният бюджет за твоя бизнес.",
  },
  {
    question: "2. Кой създава съдържанието (снимки и видеа)?",
    answer:
      "Ние поемаме дизайна, текстовете (copywriting) и цялостната стратегия. От теб се иска само да ни изпращаш сурови материали (снимки или кратки видеа от телефона ти на твоите продукти/услуги). Ние ги обработваме, монтираме (с ефекти и трендинг музика) и ги превръщаме в професионално съдържание, готово за публикуване.",
  },
  {
    question: "3. Кога ще започна да виждам реални продажби и запитвания?",
    answer:
      "Платените реклами са проектирани да носят директен трафик и могат да генерират първите потенциални клиенти буквално часове след стартирането им. Органичното развитие (постове и сторита) е маратон, не спринт - то изгражда доверие. Обикновено първите категорични, измерими резултати и стабилизиране на продажбите се виждат след първите 30 дни работа, когато алгоритмите съберат достатъчно данни.",
  },
  {
    question: "4. Губя ли достъп до профилите си, докато вие ги управлявате?",
    answer:
      'Абсолютно не. Бизнесът и профилите са си 100% твои! Ние просто получаваме сигурен партньорски (администраторски) достъп, за да вършим работата си. Ти запазваш пълен контрол и можеш да влизаш, да четеш съобщенията си и дори да качваш свои собствени "спонтанни" сторита по всяко време.',
  },
  {
    question: "5. Вие ли ще отговаряте на съобщенията на клиентите ми?",
    answer:
      'В стандартния пакет ние модерираме коментарите и следим за спам. Отговарянето на конкретни търговски запитвания (напр. "Кога имате свободен час?" или "Имате ли този модел в червено?") остава твоя задача, тъй като ти познаваш наличностите и графика си най-добре. Ако искаш да автоматизираш това, предлагаме добавка "Настройка на Чатбот" за автоматични отговори.',
  },
  {
    question: "6. Нямам настроен Business Manager или Пиксел. Проблем ли е?",
    answer:
      "Никакъв проблем, дори е по-добре! Повечето клиенти идват при нас точно защото техническата част на Meta и Google ги обърква. В началото на съвместната ни работа ние ще създадем, свържем и подсигурим всички необходими акаунти, пиксели и каталози, за да работи всичко като швейцарски часовник.",
  },
  {
    question: "7. Трябва ли да подписвам обвързващ договор за 1 година?",
    answer:
      "Не. Ние вярваме, че добрите резултати и печалбата трябва да те задържат при нас, а не хартиените договори. Работим на ясен месечен абонамент. Можеш да прекратиш или паузираш услугата по всяко време, стига да ни предупредиш 7 дни преди края на текущия месец.",
  },
];

interface ServiceDetailSocialMediaProps {
  service: Service;
}

export function ServiceDetailSocialMedia({
  service,
}: ServiceDetailSocialMediaProps) {
  const { push } = useTransitionRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [upsells, setUpsells] = useState<CartItemUpsell[]>([]);
  const pageRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = pageRootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const sections = root.querySelectorAll<HTMLElement>(
        "[data-animate-section]",
      );
      sections.forEach((section) => {
        const reveals = section.querySelectorAll<HTMLElement>(
          "[data-animate-reveal]",
        );
        const cards = section.querySelectorAll<HTMLElement>(
          "[data-animate-card]",
        );

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

  const scrollToBuySection = () => {
    document
      .getElementById("buy-now")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const planPrice = getServicePlanPrice(service);

  const handleMarketingCheckout = () => {
    setIsAdding(true);
    const optionId = service.options[0].id;
    const result = addToCart(service.id, optionId, upsells);
    if (!result.added) {
      setIsAdding(false);
      if (result.reason === "duplicate") {
        toast(CART_DUPLICATE_SERVICE_MESSAGE);
      }
      return;
    }
    const addedItem = result.cart.items.find(
      (i) => i.serviceId === service.id && i.selectedOptionId === optionId,
    );
    if (addedItem) {
      trackMetaAddToCart([cartItemToMetaLineItem(addedItem)], {
        page_path: "/services/social-media",
      });
    }
    setTimeout(() => {
      setIsAdding(false);
      push("/cart");
    }, 250);
  };

  return (
    <div
      ref={pageRootRef}
      className="relative isolate pt-16 pb-12 md:pt-20 md:pb-16"
    >
      <ServicePageBackground />
      <div className="relative z-10">
        <ServiceDetailHero
          badgeIcon={<Smartphone className="h-4 w-4" />}
          badgeText="Пълно дигитално присъствие"
          title={
            <>
              Управление на Социални Мрежи и Реклама
              <div className="gradient-text">
                Ние поемаме контрола, ти броиш продажбите
              </div>
            </>
          }
          description={
            <>
              Забрави за стреса от постоянното мислене какво да публикувам днес.
              Ние създаваме грабващи Reels, сторита и постове, и управляваме
              печеливши реклами в Meta, Google и TikTok. Всичко на една ясна,
              фиксирана цена.
            </>
          }
          priceSlot={
            <div className="flex items-baseline gap-2">
              <Price
                value={planPrice}
                className="text-3xl sm:text-4xl text-primary"
              />
              <span className="text-muted-foreground">/месец</span>
            </div>
          }
          primaryLabel="Научи повече"
          onPrimaryClick={() => {
            trackCtaClick(
              "/services/social-media",
              "service_social_media_scroll_to_buy",
            );
            scrollToBuySection();
          }}
          backCtaId="service_social_media_back_to_services"
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
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance opacity-0 translate-y-10"
              >
                Защо хубавият сайт не стига, ако няма кой да го види?
              </h2>
              <p
                data-animate-reveal
                className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
              >
                Да управляваш бизнес и да си маркетолог едновременно е
                невъзможно.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {marketingPainPoints.map((item) => (
                <Card
                  key={item.title}
                  data-animate-card
                  className="group bg-card border-border hover:border-destructive/50 transition-all duration-300 opacity-0 translate-y-10"
                >
                  <CardContent className="p-6 md:p-7">
                    <CircleX className="h-5 w-5 text-red-500 mb-4" />
                    <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.text}
                    </p>
                  </CardContent>
                </Card>
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
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance opacity-0 translate-y-10"
              >
                Какво е включено в пакета "Социални Мрежи"?
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {marketingSolutionItems.map((item) => (
                <Card
                  key={item}
                  data-animate-card
                  className="group border-border bg-card hover:border-primary/50 transition-all duration-300 opacity-0 translate-y-10"
                >
                  <CardContent className="p-5 md:p-6 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    <p className="text-muted-foreground leading-relaxed">
                      {item}
                    </p>
                  </CardContent>
                </Card>
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
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance opacity-0 translate-y-10"
              >
                Как да стартирам социална мрежа и реклама? (Само 3 лесни стъпки)
              </h2>
              <p
                data-animate-reveal
                className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
              >
                Ние поемаме тежката работа, за да можеш да се фокусираш върху
                бизнеса си.
              </p>
            </div>
            <div className="relative">
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-border to-transparent -translate-y-1/2" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {marketingSteps.map((step, index) => (
                  <div key={step.title} className="relative">
                    <Card
                      data-animate-card
                      className="group bg-card border-border hover:border-primary/50 transition-colors h-full opacity-0 translate-y-10"
                    >
                      <CardContent className="p-6">
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
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.text}
                        </p>
                      </CardContent>
                    </Card>
                    {index < marketingSteps.length - 1 && (
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
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance opacity-0 translate-y-10"
              >
                Често задавани въпроси
              </h2>
              <p
                data-animate-reveal
                className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
              >
                Отговори на най-важните въпроси преди да стартираме съвместната
                работа.
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

        <ServiceBuySection
          service={service}
          title="Купи сега"
          description="Конфигурирай плана и добави услугата в кошницата."
          price={planPrice}
          monthlyLabel="/месец"
          upsells={upsells}
          onUpsellsChange={setUpsells}
          onAddToCart={handleMarketingCheckout}
          isAdding={isAdding}
          ctaId="service_social_media_buy_section_add_to_cart"
          ctaPage="/services/social-media"
        />
      </div>
    </div>
  );
}
