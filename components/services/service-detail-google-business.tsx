"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CheckCircle2,
  CircleX,
  ClipboardList,
  MapPin,
  MonitorCheck,
  Rocket,
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

const GOOGLE_PROFILE_OPTION_ID = "basic";

const googlePainPoints = [
  {
    title: "Невидимост въпреки отличната локация",
    text: "Плащаш наем за физически обект или предлагаш локални услуги, но хората в твоя град дори не знаят, че съществуваш. Локалното търсене (и оборотът) отиват директно при конкурентите.",
  },
  {
    title: "Губиш битката за доверие с онлайн гигантите",
    text: "Без силен, потвърден Google профил, бизнесът ти изглежда несигурен. Клиентите предпочитат да поръчат от Shein или Temu, вместо да се доверят на непознат локален бранд.",
  },
  {
    title: "Търсят точно твоето, но не стигат до теб",
    text: "Търсения като „магазин близо до мен“ или „услуги в [град]“ са пълни с готови купувачи, които Google навигира към друг адрес.",
  },
  {
    title: "Неактуална информация = ядосани клиенти",
    text: "Ако нямаш профил (или той е изоставен), клиентите не знаят кога работиш или как да се свържат с теб. Идват в почивен ден, намират затворена врата и губиш репутация.",
  },
  {
    title: "Разчиташ само на случаен трафик",
    text: "Чакаш някой просто да мине покрай витрината ти. Това е надежда, а не маркетинг, и няма да ти помогне да мащабираш бизнеса си.",
  },
] as const;

const googleSolutionItems = [
  "Пълна настройка и верификация: Ние създаваме и оптимизираме профила ти. Спестяваш си дни в лутане из тромавите процеси на Google.",
  "Локално SEO: Оптимизираме присъствието ти за ключови думи, които хората в твоя град реално търсят, за да излизаш на челни позиции в Google Maps.",
  "Абсолютна бизнес яснота: Добавяме точен адрес, работно време, телефон и директен линк към твоя сайт или онлайн магазин.",
  "Професионална витрина: Качваме качествени снимки на обекта и продуктите ти, което моментално изгражда доверие у потребителя.",
  "Дигитално меню/каталог (Опция): Можем да добавим до 15 продукта безплатно (и €0.20/продукт след това), за да могат клиентите да видят какво предлагаш, преди изобщо да те посетят.",
  "Разширен обхват (Опция): Предлагаме вписване в Waze, Apple Maps, TomTom и Here WeGo за още по-мащабна видимост сред шофьори и пешеходци.",
] as const;

const googleSteps = [
  {
    title: "Базова настройка (€49)",
    text: "Създаваме и оптимизираме Google Business профила за вашия физически магазин - категории, ключови думи и локация, за да се появявате, когато някой наблизо търси стоката ви.",
    icon: MapPin,
  },
  {
    title: "Верификация и разширения",
    text: "Поемаме верификацията пред Google (видео, телефон или поща). По желание добавяте месечни публикации или присъствие в Waze и Apple Maps - за още повече пътища към вратата ви.",
    icon: MonitorCheck,
  },
  {
    title: "Безплатен локален трафик",
    text: "Профилът работи като дигитална визитка 24/7: обаждания, маршрути, отзиви и посещения от хора с готово намерение да купят - без да плащате за всеки клик като в рекламата.",
    icon: Rocket,
  },
] as const;

const FAQ_ITEMS: FaqItem[] = [
  {
    question:
      "1. Защо ми е Google профил, ако вече имам силна Facebook страница?",
    answer:
      'Защото платформите служат за различно. Във Facebook хората скролват и разглеждат. В Google вече са решили да купят - пишат „магазин за рокли близо до мен“ или „магазин за обувки [град]“. Верифицираният физически обект на картата е вашето №1 оръжие срещу анонимните само-онлайн магазини: показва, че сте реални, на адрес, с отзиви - не „страница без адрес“. Ако липсвате в Maps, горещият клиент влиза при конкурента на 200 м.',
  },
  {
    question: "2. Плаща ли се месечна такса на Google, за да съм на картата?",
    answer:
      "Не. Google Maps и Business Profile са безплатни. Плащате ни еднократно €49 за професионално изграждане, верификация и локално SEO. След това профилът носи посещения и обаждания без месечна такса към Google. (По желание - месечна поддръжка и публикации, ако искате да доминирате над другите магазини в квартала.)",
  },
  {
    question: "3. Защо да плащам на агенция, не мога ли да си го направя сам?",
    answer:
      "Можете, но много магазини остават неверифицирани, с грешна категория или на задна страница в резултатите. Ние знаем кои думи работят за retail („бутик“, „магазин за …“, вашият град), как да структурираме продуктите в профила и как да минем верификацията бързо - докато вие сте на щанда, не в настройките на Google.",
  },
  {
    question: "4. Колко време отнема да се появя на картата?",
    answer:
      "Оптимизацията от наша страна - няколко дни. След това верификация от Google (1–14 дни според метода: видео, телефон или писмо). Веднъж активен, започвате да се виждате при локални търсения - първите маршрути и обаждания често идват още в първите седмици.",
  },
  {
    question:
      "5. Можете ли да изтриете фалшиви негативни ревюта от конкуренти?",
    answer:
      "Директно само Google може да премахне отзив. Предлагаме добавка: подготвяме официални рапорти към Google за злонамерени или явно фалшиви ревюта - важно за магазин, който се бори за доверие срещу евтиния онлайн.",
  },
  {
    question: "6. Как мога лесно да събирам повече 5-звездни отзиви?",
    answer:
      "Отзивите са ключ за локалното класиране. При настройката ви даваме директен линк за оценка - пращате го на доволни клиенти след покупка на каса. Повече реални 5-звездни отзива = повече хора избират вашия обект вместо празния или съмнителен профил на конкурента.",
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
          badgeIcon={<MapPin className="h-4 w-4" />}
          badgeText="Локални търсения = клиенти пред вратата ти"
          title={
            <>
              Google Business профил
              <div className="gradient-text">
                Стани видим за хората, които търсят точно теб в момента
              </div>
            </>
          }
          description={
            <>
              За еднократна такса от €49 поставяме бизнеса ти на дигиталната карта. Накарай
              клиентите да те откриват лесно, без да се бориш със сложни технически настройки и без
              нужда от голям бюджет за реклама.
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
          primaryLabel="Стани видим в локалните търсения"
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
                Стани видим в локалните търсения
              </h2>
              <p
                data-animate-reveal
                className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
              >
                Накарай клиентите да те откриват лесно, дори да нямаш голям бюджет за реклама - само
                3 стъпки.
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
                За собственици на магазини с физически обект - преди да инвестирате €49 в локална
                видимост.
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
