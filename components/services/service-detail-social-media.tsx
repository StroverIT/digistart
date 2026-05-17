"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CheckCircle2,
  CircleX,
  ClipboardList,
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
import { addToCart, findCartItemByService, updateCartItemUpsells } from "@/lib/store/cart";
import type { CartItemUpsell, Service } from "@/lib/types";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { ServiceBuySection } from "@/components/services/service-buy-section";
import { getServicePlanPrice } from "@/lib/data/services";
import { Faq, type FaqItem } from "@/components/ui/faq";
import { PlansSection } from "@/components/plans/plans-section";
import { ServiceDetailHero } from "@/components/services/service-detail-hero";
import { ServicePageBackground } from "@/components/services/service-page-background";

gsap.registerPlugin(ScrollTrigger);

const marketingPainPoints = [
  {
    title: "Отлична колекция, ограничен локален трафик",
    text: "Продажбите зависят от квартала, времето и случайните минувачи. Хората от друг град дори не знаят, че съществувате.",
  },
  {
    title: "Губите клиенти към евтиния онлайн",
    text: "Shein, Temu и подобни бият с цена и удобство. Без силен бранд онлайн изглеждате „скъпи“, макар в магазина да предлагате качество и услуга.",
  },
  {
    title: "Нямате време за професионално съдържание",
    text: "Между каса, доставки и подредба на витрина няма час за Reels, монтаж и графики — а алгоритъмът награждава постоянство.",
  },
  {
    title: "Рекламите изглеждат като черна дупка",
    text: "Чували сте за хиляди левове, изхарчени без продажби. Страхувате се да пуснете бюджет, който не върне реални купувачи в щанда.",
  },
  {
    title: "Случайните публикации не носят оборот",
    text: "Пост без стратегия носи харесвания, не поръчки и не хора през вратата в събота следобед.",
  },
  {
    title: "Онлайн изглеждате по-малки от магазина",
    text: "В обекта — премиум усещане; в профила — случайни снимки. Клиентът не вярва, че си заслужава цената спрямо „евтиния“ конкурент.",
  },
] as const;

const marketingSolutionItems = [
  "Органично съдържание: Превръщаме суровите снимки и клипове от магазина ви в премиум постове — 2 публикации седмично, постоянен и професионален профил.",
  "Copywriting и дизайн: Текстове и визии, които продават колекцията и услугата ви — не „красиви картинки“, а ясна стойност спрямо онлайн гигантите.",
  "Месечен план: Знаете какво излиза и кога — нови пристигания, промоции, сезон — без да импровизирате вечер след затваряне.",
  "Реклами с контролиран бюджет: Таргетираме хора във вашия град (за посещения в обекта) или цяла България (за онлайн поръчки и съобщения) — ние настройваме и оптимизираме, вие одобрявате посоката.",
  "Отчет и следващи стъпки: Всеки месец виждате какво е донесло запитвания, посещения и продажби — и какво подобряваме следващия месец.",
] as const;

const marketingSteps = [
  {
    title: "Стартирате с базов пакет",
    text: "За €200/месец получавате поддръжка на 1 канал, 2 качествени публикации седмично и ясен тон на бранда — без да наемате агенция за 2000+ лв. и без да учите алгоритми.",
    icon: ShoppingCart,
  },
  {
    title: "Изпращате суров материал, ние монтираме и публикуваме",
    text: "Взимате телефона, снимате за 1–2 минути нова колекция на манекени или витрина, пращате ни файловете. Ние — монтаж, трендинг звук, графики, текстове, планиране и (по избор) управление на реклами и чатбот за запитвания.",
    icon: Smartphone,
  },
  {
    title: "Пускаме реклами и мерим продажбите",
    text: "Кампаниите тръгват към локални купувачи или национална аудитория. Следите запитванията и поръчките; ние оптимизираме. Ако до 30 дни няма реализирана продажба — връщаме сумата за нашата услуга.",
    icon: Rocket,
  },
] as const;

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "1. Бюджетът за реклама включен ли е в месечната такса?",
    answer:
      "Не. Абонаментът към Digistart покрива стратегия, дизайн, текстове, публикуване и управление на кампаниите. Самият рекламен бюджет (парите към Meta, Instagram, TikTok или Google) определяте вие — теглят се от вашата карта. Ще ви предложим реалистичен минимум за магазин с физически обект: локални кампании за foot traffic и/или национални за онлайн поръчки, без да „изгорите“ наема си в реклама за седмица.",
  },
  {
    question: "2. Кой създава съдържанието (снимки и видеа)?",
    answer:
      "Вие — за минути, в магазина. Вдигате телефона, снимате бърз клип с новата колекция на манекените или витрината, пращате ни файловете. Ние монтираме с трендинг аудио, графики и продаващ текст, публикуваме по график и пускаме реклами към правилната аудитория. Не ви трябва студио, екип или вечер пред компютъра.",
  },
  {
    question: "3. Кога ще започна да виждам реални продажби и запитвания?",
    answer:
      "Платените кампании могат да донесат първи съобщения и посещения още в първите дни — особено при локален таргет „близо до магазина“. Органичните постове изграждат доверие и премиум усещане; обикновено след 30 дни имате ясна картина кои продукти и послания водят към щанда и към онлайн поръчки.",
  },
  {
    question: "4. Губя ли достъп до профилите си, докато вие ги управлявате?",
    answer:
      "Не. Страниците остават ваши. Получаваме администраторски достъп, за да публикуваме и управляваме реклами — вие влизате когато искате, виждате коментарите и можете да качите и „спонтанно“ story от обекта.",
  },
  {
    question: "5. Вие ли ще отговаряте на съобщенията на клиентите ми?",
    answer:
      "В базовия пакет модерираме коментари и спам. Конкретни запитвания за наличност, размер или час за примерка — от вас (познавате склада и графика). С добавка „Чатбот“ автоматизираме типични въпроси, за да не губите продажби, докато сте на щанда.",
  },
  {
    question: "6. Нямам настроен Business Manager или Пиксел. Проблем ли е?",
    answer:
      "Не — типично за магазини, които досега са разчитали само на улицата. При старта създаваме и свързваме Business Manager, Pixel и каталог, за да проследяваме посещения, съобщения и поръчки от рекламите ви.",
  },
  {
    question: "7. Трябва ли да подписвам обвързващ договор за 1 година?",
    answer:
      "Не. Месечен абонамент, без годишен ангажимент. Прекратявате или паузирате с предизвестие 7 дни преди края на текущия месец — резултатите и гаранцията ни за 30 дни трябва да ви задържат, не договорът.",
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
    const existing = findCartItemByService(service.id, optionId);
    if (existing) {
      updateCartItemUpsells(existing.id, upsells);
      setIsAdding(false);
      return;
    }
    const result = addToCart(service.id, optionId, upsells);
    if (!result.added) {
      setIsAdding(false);
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
          badgeText="Повече хора в магазина и поръчки извън квартала"
          title={
            <>
              Социални мрежи за физически магазин
              <div className="gradient-text">
                Премиум визия, реклами и клиенти — без агенция за хиляди левове
              </div>
            </>
          }
          description={
            <>
              „До ключ“ поддръжка от €200/месец: ние правим профила ти да изглежда като бутик, не
              като случайна страница — таргетираме хора в града за посещения и цяла България за
              онлайн поръчки. Ти снимаш за 2 минути в обекта, ние монтираме, публикуваме и
              управляваме рекламите.
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
          primaryLabel="Виж как пълним магазина и онлайн поръчките"
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
                Когато щандът е празен, а складът — пълен
              </span>
              <h2
                data-animate-reveal
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance opacity-0 translate-y-10"
              >
                Имате страхотна стока — но я виждат само минувачите от улицата
              </h2>
              <p
                data-animate-reveal
                className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
              >
                Докато управлявате обекта, наема и екипа, маркетингът в Instagram и TikTok остава
                „за утре“ — а клиентите вече купуват от Shein и Temu с един клик.
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
                Маркетинг „до ключ“ за търговец, не за инфлуенсър
              </span>
              <h2
                data-animate-reveal
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance opacity-0 translate-y-10"
              >
                Как изглежда магазинът ви онлайн, когато някой друг прави магията?
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
                Вие снимате в магазина — ние правим останалото
              </span>
              <h2
                data-animate-reveal
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance opacity-0 translate-y-10"
              >
                Повече клиенти в обекта и онлайн — без да живеете в телефона
              </h2>
              <p
                data-animate-reveal
                className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
              >
                Три стъпки, минимално ангажиране от вас. Гаранция: ако до 1 месец няма нито една
                реализирана продажба от нашата работа — връщаме 100% от таксата ни за услугата.
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
                Отговори за собственици на магазини — преди да поверите витрината си и
                рекламите ни.
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

        <PlansSection
          compact
          className="py-12 md:py-16"
        />

        <ServiceBuySection
          service={service}
          title="Купи сега"
          description="Избери базовия пакет и добавките, които имат смисъл за етапа на бизнеса ти."
          price={planPrice}
          monthlyLabel="/месец"
          upsells={upsells}
          onUpsellsChange={setUpsells}
          onAddToCart={handleMarketingCheckout}
          isAdding={isAdding}
          cartSelectedOptionId={service.options[0]?.id}
          ctaId="service_social_media_buy_section_add_to_cart"
          ctaPage="/services/social-media"
        />
      </div>
    </div>
  );
}
