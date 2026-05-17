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
    title: "Клиентите те търсят, но не те намират",
    text: "Когато някой напише услуга, продукт или бизнес като твоя в Google Maps, липсващият или празен профил го праща при конкуренцията.",
  },
  {
    title: "Изпускаш хора с готово намерение",
    text: "В социалните мрежи хората разглеждат. В Google често вече търсят къде да купят, къде да отидат или на кого да се обадят.",
  },
  {
    title: "Профилът не вдъхва доверие",
    text: "Без снимки, описание, категории, продукти и актуална информация бизнесът изглежда непълен, дори услугата ти да е добра.",
  },
  {
    title: "Информацията е грешна или разпиляна",
    text: "Работно време, телефон, адрес и линкове, въведени на различни места, объркват клиентите и намаляват обажданията.",
  },
  {
    title: "Нямаш локална дигитална визитка",
    text: "Много малки бизнеси разчитат само на Facebook страница, но Google профилът е мястото, където хората проверяват локация, ревюта и контакт.",
  },
  {
    title: "Не използваш безплатния трафик",
    text: "Добре попълненият Google профил може да носи обаждания, посещения и запитвания без постоянен рекламен бюджет.",
  },
] as const;

const googleSolutionItems = [
  "Пълно създаване и верификация: Грижим се за целия технически процес по създаване и потвърждаване на собствеността пред Google.",
  "Локално SEO: Добавяме правилните категории, описания и ключови думи, за да те откриват при релевантни търсения.",
  "Пълна бизнес информация: Коректно въведено работно време, телефон, адрес с точна локация и линк към сайта ти.",
  "Професионална визия: Качване на лого, корица и снимки, за да изглеждаш надеждно от първото търсене.",
  "Добавяне на услуги/продукти: Създаваме дигитална витрина в профила с основните ти предложения и цени.",
  "Практични добавки: Публикации, GPS навигации, Apple Maps, втори обект или дигитално меню според нуждите ти.",
] as const;

const googleSteps = [
  {
    title: "Базова настройка",
    text: "Еднократна такса от €49 за създаване и оптимизиране на профил, за да гарантираме, че бизнесът ти ще се показва в Google Maps, когато хората са наблизо.",
    icon: MapPin,
  },
  {
    title: "Разшири обхвата",
    text: "Добави абонамент за месечни публикации или вписване в популярни автомобилни навигации (Waze, Apple Maps).",
    icon: MonitorCheck,
  },
  {
    title: "Привличай трафик безплатно",
    text: "Профилът ти става ясна дигитална визитка, която генерира запитвания и клиенти от хора, които търсят твоите услуги точно сега.",
    icon: Rocket,
  },
] as const;

const FAQ_ITEMS: FaqItem[] = [
  {
    question:
      "1. Защо ми е Google профил, ако вече имам силна Facebook страница?",
    answer:
      'Защото хората използват двете платформи с различна цел. Във Facebook хората разглеждат за забавление. В Google хората търсят, когато имат спешна нужда да купят. Когато на някого му се счупи колата или търси добър ресторант за довечера, той пише в Google Maps "автосервиз близо до мен". Ако те няма там - губиш най-горещите си клиенти.',
  },
  {
    question: "2. Плаща ли се месечна такса на Google, за да съм на картата?",
    answer:
      "Не. Самата платформа на Google е напълно безплатна. Ти плащаш на нас еднократно за професионалното изграждане, верифициране (потвърждаване на собственост) и SEO оптимизиране на профила. Веднъж създаден правилно, профилът работи за теб безплатно. (Предлагаме месечна поддръжка само по твое желание, ако искаш да доминираш над конкуренцията постоянно).",
  },
  {
    question: "3. Защо да плащам на агенция, не мога ли да си го направя сам?",
    answer:
      "Можеш, но над 70% от самостоятелно направените профили остават неверифицирани, блокирани от Google или скрити на 10-та страница, защото им липсва SEO оптимизация. Ние знаем точно кои ключови думи да заложим в заглавията и описанията ти, как да структурираме услугите ти и как да преминем през тромавия процес по верификация бързо.",
  },
  {
    question: "4. Колко време отнема да се появя на картата?",
    answer:
      "Самата изработка и оптимизация от наша страна отнема няколко дни. След това следва процесът на верификация от Google (доказване, че бизнесът е твой). Този процес може да отнеме от 1 до 14 дни в зависимост от метода, който Google изисква за твоя конкретен бизнес (видео верификация, телефонно обаждане или писмо по пощата).",
  },
  {
    question:
      "5. Можете ли да изтриете фалшиви негативни ревюта от конкуренти?",
    answer:
      "Никой не може да изтрие ревю директно, освен самия Google. Ние обаче предлагаме специализирана добавка (виж в стъпката за плащане), чрез която подготвяме и подаваме официални, добре аргументирани рапорти към съпорта на Google за премахване на злонамерени и фалшиви отзиви.",
  },
  {
    question: "6. Как мога лесно да събирам повече 5-звездни отзиви?",
    answer:
      "Отзивите са най-важният фактор за алгоритъма на Google. При изработката на профила ние ще ти генерираме директен линк, който да пращаш на клиентите си.",
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
          badgeText="Локална видимост без постоянен рекламен бюджет"
          title={
            <>
              Google Business профил
              <div className="gradient-text">За да те намират, когато вече търсят</div>
            </>
          }
          description={
            <>
              Настройваме и оптимизираме профила ти в Google и Maps, за да изглеждаш надеждно,
              да събираш запитвания и да улесниш клиентите да стигнат до теб.
            </>
          }
          priceSlot={
            <Price
              value={planPrice}
              className="text-3xl sm:text-4xl text-primary"
            />
          }
          primaryLabel="Научи повече"
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
                Проблемът
              </span>
              <h2
                data-animate-reveal
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance opacity-0 translate-y-10"
              >
                Защо губиш клиенти, ако Google профилът ти не е подреден?
              </h2>
              <p
                data-animate-reveal
                className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
              >
                Малките бизнеси често имат добра услуга, но непълен профил, грешна информация или
                никаква локална оптимизация.
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
                Решението
              </span>
              <h2
                data-animate-reveal
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance opacity-0 translate-y-10"
              >
                Какво получаваш с Google Business профила?
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
                Процес
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
                Накарай клиентите да те откриват лесно, дори без голям бюджет за реклама — само 3 стъпки.
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
                Събрахме най-честите въпроси, за да вземеш решение по-бързо и
                уверено.
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
