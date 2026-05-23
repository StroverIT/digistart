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

const GOOGLE_BUSINESS_HERO_PRIMARY_CTA =
  "Стани видим, когато те търсят в Google" as const;

const GOOGLE_PROFILE_OPTION_ID = "basic";

const googlePainPoints = [
  {
    title: "Продаваш в Instagram, но в Google не съществуваш",
    text: "Публикуваш в Instagram, Facebook или OLX, но когато някой напише името ти в Google, вижда само конкуренти, големи магазини или нищо. Губиш купувачи, които вече са заинтересовани.",
  },
  {
    title: "„Изглеждаш ли legit?“ — питат, преди да пишат в DM",
    text: "Без верифициран Google профил изглеждаш като още един анонимен профил в социалните мрежи. Клиентите предпочитат продавачи с отзиви и официално присъствие, вместо да рискуват с непознат акаунт.",
  },
  {
    title: "Търсят бранда ти, но отиват при друг продавач",
    text: "Търсения като „[име на бранд]“, „[продукт] Instagram“ или „[категория] OLX“ са пълни с хора, готови да купят — но Google ги води към по-известни профили, защото ти липсваш.",
  },
  {
    title: "Празен Google профил = червен флаг преди поръчка",
    text: "Преди да ти пишат в Messenger или Viber, много купувачи проверяват в Google. Липсващ профил, остарели снимки или нула отзиви карат клиента да затвори таба и да избере по-сигурно изглеждащ конкурент.",
  },
  {
    title: "Разчиташ само на сторита и платена реклама",
    text: "Всеки нов клиент идва от boost във Facebook или сарафин в Instagram. Без органично присъствие в Google плащаш за всеки reach и не изграждаш дългосрочно доверие извън един канал.",
  },
] as const;

const googleSolutionItems = [
  "Пълна настройка и верификация: Създаваме и оптимизираме профила ти за продажби през социални мрежи и маркетплейси — без физически магазин. Спестяваш си дни в тромавите процеси на Google.",
  "SEO за бранд и продукти: Оптимизираме профила за думи, по които реално търсят твоите продукти и името на бранда, за да излизаш в Google Search, когато някой те проверява преди поръчка.",
  "Ясен път към поръчка: Линк към Instagram, Facebook страница, OLX обяви или сайт — плюс контакти, зона на доставка и часове за поръчки. Клиентът знае как да ти пише още преди да отвори DM.",
  "Професионална витрина: Качваме снимки на продуктите и бранда ти, които изграждат доверие още в резултатите от търсенето — не само в сторитата.",
  "Продуктов каталог (Опция): До 15 продукта безплатно в профила (и €0.20/продукт след това) — купувачите виждат какво предлагаш директно в Google, без да скролват feed-а.",
  "Разширена видимост (Опция): Bing Places, Yahoo Local или Apple Maps — за още канали, през които клиентите да те открият извън Instagram и Facebook.",
] as const;

const googleSteps = [
  {
    title: "Профил за социални продажби",
    text: "Настройваме Google Business профила за продавачи в Instagram, Facebook, OLX и подобни — правилни категории, ключови думи и структура, без физически обект.",
    icon: ShoppingBag,
  },
  {
    title: "Верификация и разширения",
    text: "Поемаме верификацията пред Google (видео, телефон или поща). По желание добавяш месечни публикации, продуктов каталог или присъствие в Bing и Apple Maps.",
    icon: MonitorCheck,
  },
  {
    title: "Доверие и откриваемост 24/7",
    text: "Профилът работи като официална визитка: отзиви, кликове към профилите ти и запитвания от хора, които вече са видели рекламата ти — без да плащаш за всеки клик.",
    icon: Rocket,
  },
] as const;

const FAQ_ITEMS: FaqItem[] = [
  {
    question:
      "1. Защо ми е Google профил, ако вече продавам в Instagram и Facebook?",
    answer:
      "Защото каналите работят различно. Във Instagram хората скролват и пишат в DM; в Google вече търсят името ти или проверяват дали продавачът е легитимен, преди да поръчат. Верифицираният профил с отзиви, снимки и линк към профилите ти е твоето доказателство срещу анонимните акаунти — преди клиентът да ти пише „Има ли още?“.",
  },
  {
    question:
      "2. Мога ли да имам Google Business профил, ако продавам само в социалните мрежи?",
    answer:
      "Да. За продавачи в Instagram, Facebook, OLX и подобни настройваме профила като бизнес с обслужвана зона или без публичен адрес — фокусът е върху бранда, продуктите, линковете към профилите ти и отзивите, не върху витрина на улица.",
  },
  {
    question: "3. Плаща ли се месечна такса на Google?",
    answer:
      "Не. Google Business Profile е безплатен. Плащаш ни еднократно €49 за изграждане, верификация и SEO оптимизация. След това профилът носи кликове към Instagram, OLX или сайта ти и запитвания без месечна такса към Google. (По желание — месечна поддръжка и публикации, ако искаш постоянно активен профил.)",
  },
  {
    question: "4. Защо да плащам на агенция, не мога ли да си го направя сам?",
    answer:
      "Можеш, но много продавачи в социалните мрежи остават неверифицирани, с грешна категория или извън първите резултати. Ние знаем кои думи работят за твоя бранд и категория, как да подредим каталога и как да минем верификацията — докато ти отговаряш на съобщения и опаковаш поръчки, не Google настройки.",
  },
  {
    question: "5. Колко време отнема да започна да се виждам в Google?",
    answer:
      "Оптимизацията от наша страна — няколко дни. След това верификация от Google (1–14 дни според метода). Веднъж активен, започваш да се появяваш при търсения на бранда и категорията — първите кликове към профилите ти често идват още в първите седмици.",
  },
  {
    question:
      "6. Как стои въпросът с фалшиви негативни ревюта от конкуренти?",
    answer:
      "Само Google може да премахне отзив. Предлагаме добавка: подготвяме официални рапорти за злонамерени или явно фалшиви ревюта — особено важно, когато се бориш за доверие срещу по-големи профили и магазини.",
  },
  {
    question: "7. Как лесно да събирам 5-звездни отзиви от клиенти в социалните мрежи?",
    answer:
      "Отзивите са ключ за класирането и доверието. При настройката ти даваме директен линк за оценка — пращаш го след доставена поръчка в Messenger, Viber или Instagram DM. Повече реални отзиви = повече хора избират теб вместо празния профил на конкурента.",
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
          badgeText="Преди да ти пишат в DM — проверяват в Google"
          title={
            <>
              Google Business профил
              <div className="gradient-text">
                Доверие и видимост за продавачи в Instagram, Facebook и OLX
              </div>
            </>
          }
          description={
            <>
              За еднократна такса настройваме Google профил за хора, които продават през социални
              мрежи и маркетплейси. Клиентите те намират в търсенето, виждат отзиви и стигат до
              профилите ти — без сложни настройки и без месечна такса към Google.
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
                Те те търсят в Google, но не те намират
              </span>
              <h2
                data-animate-reveal
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance opacity-0 translate-y-10"
              >
                Имаш страхотни продукти в Instagram и OLX, но купувачите избират конкурента, защото
                в Google не изглеждаш legit.
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
                Стани видим в Google — без физически магазин
              </h2>
              <p
                data-animate-reveal
                className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
              >
                Накарай купувачите да те откриват и да ти се доверят, дори да продаваш само през
                Instagram, Facebook или OLX — само 3 стъпки.
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
                За продавачи в социалните мрежи и маркетплейси — преди да инвестираш €49 в
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
