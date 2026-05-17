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
    title: "Скъп наем, невидимост на два пресечка",
    text: "Плащате за премиум адрес, но съседите и минувачите от друг квартал дори не знаят, че сте там. Локалното търсене отива при по-гласния конкурент.",
  },
  {
    title: "Губите доверие спрямо fast-fashion онлайн",
    text: "Shein и Temu изглеждат „лесни и евтини“. Без силен Google профил физическият ви магазин изглежда несигурен — макар в обекта да предлагате качество и примерка.",
  },
  {
    title: "Търсят точно вашето — Google праща при другия",
    text: "„Магазин за рокли близо до мен“, „подаръци в [град]“ — готови купувачи, които никога не стигат до витрината ви.",
  },
  {
    title: "Празни часове, които струват пари",
    text: "Сутрин и следобед щандът е празен, а разходите текат. Всяка загубена посещаемост е изгубен наем за този час.",
  },
  {
    title: "Грешно работно време онлайн — ядосани клиенти",
    text: "Идват в почивен ден или след затваряне, защото в Google е остаряла информация. Губите продажба и репутация наведнъж.",
  },
  {
    title: "Разчитате само на случайния минувач",
    text: "Без карта, без отзиви, без оптимизация — маркетингът ви е „който мине покрай прозореца“. Това не мащабира оборот и не оправдава локацията.",
  },
] as const;

const googleSolutionItems = [
  "Пълно създаване и верификация: Ние минаваме тромавия процес с Google — вие не губите дни в настройки, обаждания и отхвърлени заявки.",
  "Локално SEO: Хващаме хората във вашия град и квартал, които търсят това, което продавате — „дрехи“, „обувки“, „подаръци“ — и ви показваме, когато са готови да влязат в магазина.",
  "Пълна бизнес информация: Точен адрес с GPS, телефон, работно време и линк към сайт/онлайн магазин — клиентът идва подготвен, не объркан.",
  "Професионална визия: Качваме снимки на физическия ви обект, витрина и продукти — премиум усещане и доверие спрямо съмнителните само-онлайн магазини.",
  "Дигитална витрина с продукти/услуги: Основни категории, артикули и ориентировъчни цени в профила — хората виждат какво предлагате, преди да прекрачат прага.",
  "Практични добавки: Публикации за нови колекции, навигация (Waze, Apple Maps), втори обект или месечни актуализации — според нуждите на магазина ви.",
] as const;

const googleSteps = [
  {
    title: "Базова настройка (€49)",
    text: "Създаваме и оптимизираме Google Business профила за вашия физически магазин — категории, ключови думи и локация, за да се появявате, когато някой наблизо търси стоката ви.",
    icon: MapPin,
  },
  {
    title: "Верификация и разширения",
    text: "Поемаме верификацията пред Google (видео, телефон или поща). По желание добавяте месечни публикации или присъствие в Waze и Apple Maps — за още повече пътища към вратата ви.",
    icon: MonitorCheck,
  },
  {
    title: "Безплатен локален трафик",
    text: "Профилът работи като дигитална визитка 24/7: обаждания, маршрути, отзиви и посещения от хора с готово намерение да купят — без да плащате за всеки клик като в рекламата.",
    icon: Rocket,
  },
] as const;

const FAQ_ITEMS: FaqItem[] = [
  {
    question:
      "1. Защо ми е Google профил, ако вече имам силна Facebook страница?",
    answer:
      'Защото платформите служат за различно. Във Facebook хората скролват и разглеждат. В Google вече са решили да купят — пишат „магазин за рокли близо до мен“ или „магазин за обувки [град]“. Верифицираният физически обект на картата е вашето №1 оръжие срещу анонимните само-онлайн магазини: показва, че сте реални, на адрес, с отзиви — не „страница без адрес“. Ако липсвате в Maps, горещият клиент влиза при конкурента на 200 м.',
  },
  {
    question: "2. Плаща ли се месечна такса на Google, за да съм на картата?",
    answer:
      "Не. Google Maps и Business Profile са безплатни. Плащате ни еднократно €49 за професионално изграждане, верификация и локално SEO. След това профилът носи посещения и обаждания без месечна такса към Google. (По желание — месечна поддръжка и публикации, ако искате да доминирате над другите магазини в квартала.)",
  },
  {
    question: "3. Защо да плащам на агенция, не мога ли да си го направя сам?",
    answer:
      "Можете, но много магазини остават неверифицирани, с грешна категория или на задна страница в резултатите. Ние знаем кои думи работят за retail („бутик“, „магазин за …“, вашият град), как да структурираме продуктите в профила и как да минем верификацията бързо — докато вие сте на щанда, не в настройките на Google.",
  },
  {
    question: "4. Колко време отнема да се появя на картата?",
    answer:
      "Оптимизацията от наша страна — няколко дни. След това верификация от Google (1–14 дни според метода: видео, телефон или писмо). Веднъж активен, започвате да се виждате при локални търсения — първите маршрути и обаждания често идват още в първите седмици.",
  },
  {
    question:
      "5. Можете ли да изтриете фалшиви негативни ревюта от конкуренти?",
    answer:
      "Директно само Google може да премахне отзив. Предлагаме добавка: подготвяме официални рапорти към Google за злонамерени или явно фалшиви ревюта — важно за магазин, който се бори за доверие срещу евтиния онлайн.",
  },
  {
    question: "6. Как мога лесно да събирам повече 5-звездни отзиви?",
    answer:
      "Отзивите са ключ за локалното класиране. При настройката ви даваме директен линк за оценка — пращате го на доволни клиенти след покупка на каса. Повече реални 5-звездни отзива = повече хора избират вашия обект вместо празния или съмнителен профил на конкурента.",
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
          badgeText="Безплатни локални търсения → клиенти през вратата"
          title={
            <>
              Google Business за физически магазин
              <div className="gradient-text">Пусни хората от картата директно в обекта</div>
            </>
          }
          description={
            <>
              Профил „до ключ“ за €49 еднократно: слагаме магазина ви на картата, оптимизираме за
              търсения като „магазин за дрехи близо до мен“ и изграждаме доверие със снимки на
              реалния обект — без постоянен рекламен бюджет и без да се борите с техническите
              настройки на Google.
            </>
          }
          priceSlot={
            <Price
              value={planPrice}
              className="text-3xl sm:text-4xl text-primary"
            />
          }
          primaryLabel="Виж как локалните търсения пълнят магазина"
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
                Плащате наем — а Google не ви вижда
              </span>
              <h2
                data-animate-reveal
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance opacity-0 translate-y-10"
              >
                Добра стока и локация — но клиентите минават покрай вас и влизат при конкурента
              </h2>
              <p
                data-animate-reveal
                className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
              >
                Докато празните часове харчат наем и заплати, хората на два пресечка от вас търсят
                точно това, което продавате — и Google ги води другаде.
              </p>
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
                Вашето №1 оръжие срещу анонимния онлайн
              </span>
              <h2
                data-animate-reveal
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance opacity-0 translate-y-10"
              >
                Как Google профилът превръща локалните търсения в хора на щанда?
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
                До ключ — вие посрещате, ние настройваме
              </span>
              <h2
                data-animate-reveal
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance opacity-0 translate-y-10"
              >
                От „невидими на картата“ до клиенти на вратата за 3 стъпки
              </h2>
              <p
                data-animate-reveal
                className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
              >
                Без технически екип. Пращате ни данни и снимки от обекта — ние създаваме, верифицираме
                и оптимизираме профила. Вие отваряте вратата за новите посетители.
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
                За собственици на магазини с физически обект — преди да инвестирате €49 в локална
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

        <PlansSection
          compact
          className="py-12 md:py-16"
        />

        <ServiceBuySection
          service={service}
          title="Купи сега"
          description="Избери базова настройка и добавките, които ще помогнат на клиентите да те намират по-лесно."
          price={planPrice}
          upsells={upsells}
          onUpsellsChange={setUpsells}
          onAddToCart={handleGoogleCheckout}
          isAdding={isAdding}
          cartSelectedOptionId={GOOGLE_PROFILE_OPTION_ID}
          ctaId="service_google_business_buy_section_add_to_cart"
          ctaPage="/services/google-business"
        />
      </div>
    </div>
  );
}
