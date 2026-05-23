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
  Search,
  ShoppingBag,
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
import { ServiceSectionBuyCta } from "@/components/services/service-section-buy-cta";

gsap.registerPlugin(ScrollTrigger);

const GOOGLE_BUSINESS_HERO_PRIMARY_CTA = "Стани видим в Google търсенията" as const;

const GOOGLE_PROFILE_OPTION_ID = "basic";

const googlePainPoints = [
  {
    title: "Страхотни продукти, нулева видимост в Google",
    text: "Продаваш онлайн през собствен сайт или социални мрежи, но в Google изобщо не съществуваш. Когато някой търси категорията ти или името на бранда, вижда само конкуренти и маркетплейси.",
  },
  {
    title: "Губиш битката за доверие с онлайн гигантите",
    text: "Без верифициран Google профил изглеждаш като анонимен продавач. Клиентите предпочитат Temu, eMAG или Amazon, вместо непознат онлайн магазин без отзиви и официално присъствие.",
  },
  {
    title: "Търсят точно твоето, но кликват другаде",
    text: "Търсения като „[продукт] онлайн“, „[категория] България“ или името на бранда ти са пълни с готови купувачи — но Google ги води към по-известни магазини, защото ти липсваш.",
  },
  {
    title: "Липсващ или изоставен профил = съмнение преди покупка",
    text: "Преди да поръчат, хората проверяват в Google. Празен профил, остарели снимки или липса на отзиви карат клиента да затвори таба и да избере по-сигурно изглеждащ конкурент.",
  },
  {
    title: "Разчиташ само на платена реклама",
    text: "Всеки нов клиент идва от Facebook реклама или сарафин маркетинг. Без органично присъствие в Google плащаш за всеки клик и не изграждаш дългосрочно доверие.",
  },
] as const;

const googleSolutionItems = [
  "Пълна настройка и верификация: Създаваме и оптимизираме профила ти за онлайн продажби — без физически магазин. Спестяваш си дни в тромавите процеси на Google.",
  "SEO за продукти и бранд: Оптимизираме профила за думи, по които реално търсят твоите продукти и името на магазина, за да излизаш в Google Search и Knowledge Panel.",
  "Ясен път към покупка: Директен линк към онлайн магазина, контакти, зона на доставка и работно време за поръчки — клиентът знае как да купи още преди да влезе в сайта.",
  "Професионална витрина: Качваме снимки на продуктите и бранда ти, които изграждат доверие още в резултатите от търсенето.",
  "Продуктов каталог (Опция): До 15 продукта безплатно в профила (и €0.20/продукт след това) — купувачите виждат асортимента директно в Google.",
  "Разширена видимост (Опция): Bing Places, Yahoo Local или Apple Maps — за още канали, през които клиентите да открият онлайн магазина ти.",
] as const;

const googleSteps = [
  {
    title: "Профил за онлайн магазин",
    text: "Настройваме Google Business профила за продажба на продукти онлайн — правилни категории, ключови думи и структура, без да изискваме физически обект.",
    icon: ShoppingBag,
  },
  {
    title: "Верификация и разширения",
    text: "Поемаме верификацията пред Google (видео, телефон или поща). По желание добавяш месечни публикации, продуктов каталог или присъствие в Bing и Apple Maps.",
    icon: MonitorCheck,
  },
  {
    title: "Органичен трафик 24/7",
    text: "Профилът работи като дигитална визитка: отзиви, кликове към магазина и запитвания от хора, които вече търсят твоите продукти — без да плащаш за всеки клик в реклама.",
    icon: Rocket,
  },
] as const;

const FAQ_ITEMS: FaqItem[] = [
  {
    question:
      "1. Защо ми е Google профил, ако вече имам онлайн магазин и Facebook?",
    answer:
      "Защото каналите работят различно. Във Facebook хората скролват; в Google вече търсят конкретен продукт или проверяват дали магазинът е легитимен. Верифицираният профил с отзиви, снимки и линк към сайта е твоето доказателство срещу анонимните продавачи — преди клиентът да натисне „Поръчай“.",
  },
  {
    question: "2. Мога ли да имам Google Business профил без физически магазин?",
    answer:
      "Да. За онлайн продажби настройваме профила като бизнес с обслужвана зона или без публичен адрес — фокусът е върху бранда, продуктите, линка към магазина и отзивите, не върху витрина на улица.",
  },
  {
    question: "3. Плаща ли се месечна такса на Google?",
    answer:
      "Не. Google Business Profile е безплатен. Плащаш ни еднократно €49 за изграждане, верификация и SEO оптимизация. След това профилът носи кликове към магазина и запитвания без месечна такса към Google. (По желание — месечна поддръжка и публикации, ако искаш постоянно активен профил.)",
  },
  {
    question: "4. Защо да плащам на агенция, не мога ли да си го направя сам?",
    answer:
      "Можеш, но много онлайн магазини остават неверифицирани, с грешна категория или извън първите резултати. Ние знаем кои думи работят за e-commerce („онлайн магазин за …“, категория продукт, името на бранда), как да подредим каталога и как да минем верификацията — докато ти опаковаш поръчки, не Google настройки.",
  },
  {
    question: "5. Колко време отнема да започна да се виждам в Google?",
    answer:
      "Оптимизацията от наша страна — няколко дни. След това верификация от Google (1–14 дни според метода). Веднъж активен, започваш да се появяваш при търсения на бранда и категорията — първите кликове към магазина често идват още в първите седмици.",
  },
  {
    question:
      "6. Как стои въпросът с фалшиви негативни ревюта от конкуренти?",
    answer:
      "Само Google може да премахне отзив. Предлагаме добавка: подготвяме официални рапорти за злонамерени или явно фалшиви ревюта — особено важно, когато се бориш за доверие срещу големите маркетплейси.",
  },
  {
    question: "7. Как лесно да събирам 5-звездни отзиви от онлайн клиенти?",
    answer:
      "Отзивите са ключ за класирането и доверието. При настройката ти даваме директен линк за оценка — пращаш го след доставена поръчка по имейл, Viber или в благодарствено съобщение. Повече реални отзиви = повече хора избират теб вместо празния профил на конкурента.",
  },
];

interface ServiceDetailGoogleBusinessProps {
  service: Service;
}

export function ServiceDetailGoogleBusiness({
  service,
}: ServiceDetailGoogleBusinessProps) {
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

  const planPrice = getServicePlanPrice(service, GOOGLE_PROFILE_OPTION_ID);

  const handleGoogleCheckout = () => {
    setIsAdding(true);
    const existing = findCartItemByService(service.id, GOOGLE_PROFILE_OPTION_ID);
    if (existing) {
      updateCartItemUpsells(existing.id, upsells);
      setIsAdding(false);
      return;
    }
    const result = addToCart(service.id, GOOGLE_PROFILE_OPTION_ID, upsells);
    if (!result.added) {
      setIsAdding(false);
      return;
    }
    const addedItem = result.cart.items.find(
      (i) =>
        i.serviceId === service.id &&
        i.selectedOptionId === GOOGLE_PROFILE_OPTION_ID,
    );
    if (addedItem) {
      trackMetaAddToCart([cartItemToMetaLineItem(addedItem)], {
        page_path: "/services/google-business",
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
          badgeIcon={<Search className="h-4 w-4" />}
          badgeText="Google търсене = купувачи с готово намерение"
          title={
            <>
              Google Business профил
              <div className="gradient-text">
                Изгради доверие и видимост за онлайн магазина си — без физически обект
              </div>
            </>
          }
          description={
            <>
              За еднократна такса настройваме Google профил, оптимизиран за продажба на продукти
              онлайн. Клиентите те намират в търсенето, виждат отзиви и стигат директно до
              магазина — без сложни настройки и без месечна такса към Google.
            </>
          }
          priceSlot={
            <div className="flex items-baseline gap-2">
              <Price
                value={planPrice}
                className="text-3xl sm:text-4xl text-primary"
              />
              <span className="text-muted-foreground">еднократно</span>
            </div>
          }
          primaryLabel={GOOGLE_BUSINESS_HERO_PRIMARY_CTA}
          onPrimaryClick={() => {
            trackCtaClick(
              "/services/google-business",
              "service_google_business_scroll_to_buy",
            );
            scrollToBuySection();
          }}
          backCtaId="service_google_business_back_to_services"
        />

        <section data-animate-section className="py-8 md:py-20 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
              <span
                data-animate-reveal
                className="text-primary font-semibold text-sm uppercase tracking-wider mb-3 block opacity-0 translate-y-10"
              >
                Клиентите търсят, но Google не те показва
              </span>
              <h2
                data-animate-reveal
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance opacity-0 translate-y-10"
              >
                Имаш страхотен продукт, но клиентите влизат при конкурента, защото просто не те
                откриват онлайн.
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {googlePainPoints.map((item) => (
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
            <div
              data-animate-reveal
              className="mt-8 md:mt-10 opacity-0 translate-y-10"
            >
              <ServiceSectionBuyCta
                pagePath="/services/google-business"
                ctaId="service_google_business_section_pain_scroll_buy"
                label={GOOGLE_BUSINESS_HERO_PRIMARY_CTA}
              />
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
                Безплатен трафик 24/7
              </span>
              <h2
                data-animate-reveal
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance opacity-0 translate-y-10"
              >
                Как един оптимизиран Google профил се превръща в дигитална визитка, която генерира
                запитвания?
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {googleSolutionItems.map((item) => (
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
            <div
              data-animate-reveal
              className="mt-8 md:mt-10 opacity-0 translate-y-10"
            >
              <ServiceSectionBuyCta
                pagePath="/services/google-business"
                ctaId="service_google_business_section_solution_scroll_buy"
                label={GOOGLE_BUSINESS_HERO_PRIMARY_CTA}
              />
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
                Готово решение - без технически главоболия
              </span>
              <h2
                data-animate-reveal
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance opacity-0 translate-y-10"
              >
                Стани видим в Google — без витрина на улица
              </h2>
              <p
                data-animate-reveal
                className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
              >
                Накарай купувачите да те откриват и да ти се доверят, дори да продаваш само онлайн —
                само 3 стъпки.
              </p>
            </div>
            <div className="relative">
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-border to-transparent -translate-y-1/2" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {googleSteps.map((step, index) => (
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
                    {index < googleSteps.length - 1 && (
                      <div className="lg:hidden flex justify-center my-4">
                        <div className="h-8 w-0.5 bg-border" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div
              data-animate-reveal
              className="mt-8 md:mt-10 opacity-0 translate-y-10"
            >
              <ServiceSectionBuyCta
                pagePath="/services/google-business"
                ctaId="service_google_business_section_steps_scroll_buy"
                label={GOOGLE_BUSINESS_HERO_PRIMARY_CTA}
              />
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
                За собственици на онлайн магазини без физически обект — преди да инвестираш €49 в
                видимост в Google.
              </p>
            </div>
            <div
              data-animate-card
              className="mx-auto max-w-4xl rounded-2xl border border-border bg-card px-5 py-2 sm:px-8 sm:py-4 opacity-0 translate-y-10"
            >
              <Faq items={FAQ_ITEMS} />
            </div>
            <div
              data-animate-reveal
              className="mt-8 md:mt-10 opacity-0 translate-y-10"
            >
              <ServiceSectionBuyCta
                pagePath="/services/google-business"
                ctaId="service_google_business_section_faq_scroll_buy"
                label={GOOGLE_BUSINESS_HERO_PRIMARY_CTA}
              />
            </div>
          </div>
        </section>


        <ServiceBuySection
          service={service}
          title="Купи сега"
          price={planPrice}
          upsells={upsells}
          onUpsellsChange={setUpsells}
          onAddToCart={handleGoogleCheckout}
          isAdding={isAdding}
          cartSelectedOptionId={GOOGLE_PROFILE_OPTION_ID}
          ctaId="service_google_business_buy_section_add_to_cart"
          ctaPage="/services/google-business"
        />

        <PlansSection
          compact
          className="py-12 md:py-16"
        />
      </div>
    </div>
  );
}
