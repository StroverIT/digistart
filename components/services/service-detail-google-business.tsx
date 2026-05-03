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
  ShoppingCart,
} from "lucide-react";
import { cartItemToMetaLineItem, trackMetaAddToCart } from "@/lib/analytics/meta-pixel";
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

gsap.registerPlugin(ScrollTrigger);

const GOOGLE_PROFILE_OPTION_ID = "basic";

const googlePainPoints = [
  {
    title: "Оставаш невидим за града си",
    text: "Хората извън квартала не знаят, че магазинът ти съществува. Оптимизираният профил те показва при локални търсения в целия град.",
  },
  {
    title: 'Изпускаш „горещите“ търсения',
    text: 'Когато хората търсят специфични продукти („обувки близо до мен“), ти просто не се показваш.',
  },
  {
    title: "AI търсачките те игнорират",
    text: 'Ако потребител попита изкуствения интелект за „магазин, който работи сега“, AI няма да препоръча твоя магазин, ако профилът ти не е оптимизиран.',
  },
  {
    title: "Губиш хората по пътя",
    text: "Клиентите се лутат и се отказват, защото навигацията ги праща на грешно място заради неточен пин (маркер).",
  },
  {
    title: 'Клиентите „целуват вратата“',
    text: "Ако имаш старо или грешно работно време в интернет, клиентите идват, когато е затворено, и си тръгват разочаровани.",
  },
  {
    title: "Губиш обаждания",
    text: 'Никой не ти звъни за запитвания, защото нямаш добавен актуален бутон „Обади се“ директно в търсачката.',
  },
] as const;

const googleSolutionItems = [
  "Пълно създаване и верификация: Грижим се за целия технически процес по създаване и потвърждаване на собствеността пред Google.",
  "Локално SEO (Оптимизация): Добавяме правилните ключови думи в описанието, за да излизаш по-напред в търсенията.",
  "Пълна бизнес информация: Коректно въведено работно време, телефон, адрес с точна локация и линк към сайта ти.",
  "Професионална визия: Качване на лого, корица и снимки на обекта, за да изглеждаш максимално представително.",
  "Добавяне на услуги/продукти: Създаваме дигитална витрина в Google профила с основните ти предложения и цени.",
] as const;

const googleSteps = [
  {
    title: "Стъпка 1: Поръчка онлайн",
    text: "Избираш пакета и плащаш еднократно и сигурно през нашия сайт. Край на скритите такси.",
    icon: ShoppingCart,
  },
  {
    title: "Стъпка 2: Демо версия и настройка",
    text: "Изграждаме профила с всички данни, снимки и ключови думи. Преглеждаш го, за да потвърдиш, че отговаря на нуждите ти.",
    icon: MonitorCheck,
  },
  {
    title: "Стъпка 3: Официално в Google",
    text: "Завършваме верификацията и профилът ти е публичен. Вече си на картата и готов да събираш ревюта и обаждания.",
    icon: Rocket,
  },
] as const;

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "1. Защо ми е Google профил, ако вече имам силна Facebook страница?",
    answer:
      'Защото хората използват двете платформи с различна цел. Във Facebook хората разглеждат за забавление. В Google хората търсят, когато имат спешна нужда да купят. Когато на някого му се счупи колата или търси добър ресторант за довечера, той пише в Google Maps "автосервиз близо до мен". Ако те няма там - губиш най-горещите си клиенти.',
  },
  {
    question: "2. Плаща ли се месечна такса на Google, за да съм на картата?",
    answer:
      "Не. Самата платформа на Google е напълно безплатна. Ти плащаш на нас еднократно за професионалното изграждане, верифициране (потвърждаване на собственост) и SEO оптимизиране на профила. Веднъж създаден правилно, профилът работи за теб безплатно. (Предлагаме месечна поддръжка само по твое желание, ако искаш да доминираш над конкуренцията постоянно).",
  },
  {
    question: "3. Мога ли да имам профил, ако нямам физически офис или магазин?",
    answer:
      'Да, абсолютно! Ако предлагаш услуги на адрес на клиента (например: ВиК услуги, почистване по домовете, пътна помощ, мобилен фризьор), ние ще настроим профила ти като "Бизнес с обслужван район". Така клиентите ще те намират в твоя град, без да виждат личния ти домашен адрес на картата.',
  },
  {
    question: "4. Защо да плащам на агенция, не мога ли да си го направя сам?",
    answer:
      "Можеш, но над 70% от самостоятелно направените профили остават неверифицирани, блокирани от Google или скрити на 10-та страница, защото им липсва SEO оптимизация. Ние знаем точно кои ключови думи да заложим в заглавията и описанията ти, как да структурираме услугите ти и как да преминем през тромавия процес по верификация бързо.",
  },
  {
    question: "5. Колко време отнема да се появя на картата?",
    answer:
      "Самата изработка и оптимизация от наша страна отнема няколко дни. След това следва процесът на верификация от Google (доказване, че бизнесът е твой). Този процес може да отнеме от 1 до 14 дни в зависимост от метода, който Google изисква за твоя конкретен бизнес (видео верификация, телефонно обаждане или писмо по пощата).",
  },
  {
    question: "6. Можете ли да изтриете фалшиви негативни ревюта от конкуренти?",
    answer:
      "Никой не може да изтрие ревю директно, освен самия Google. Ние обаче предлагаме специализирана добавка (виж в стъпката за плащане), чрез която подготвяме и подаваме официални, добре аргументирани рапорти към съпорта на Google за премахване на злонамерени и фалшиви отзиви.",
  },
  {
    question: "7. Как мога лесно да събирам повече 5-звездни отзиви?",
    answer:
      "Отзивите са най-важният фактор за алгоритъма на Google. При изработката на профила ние ще ти генерираме директен линк, който да пращаш на клиентите си.",
  },
];

interface ServiceDetailGoogleBusinessProps {
  service: Service;
}

export function ServiceDetailGoogleBusiness({ service }: ServiceDetailGoogleBusinessProps) {
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

  const scrollToBuySection = () => {
    document.getElementById("buy-now")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const planPrice = getServicePlanPrice(service, GOOGLE_PROFILE_OPTION_ID);

  const handleGoogleCheckout = () => {
    setIsAdding(true);
    const result = addToCart(service.id, GOOGLE_PROFILE_OPTION_ID, upsells);
    if (!result.added) {
      setIsAdding(false);
      if (result.reason === "duplicate") {
        toast(CART_DUPLICATE_SERVICE_MESSAGE);
      }
      return;
    }
    const addedItem = result.cart.items.find(
      (i) => i.serviceId === service.id && i.selectedOptionId === GOOGLE_PROFILE_OPTION_ID,
    );
    if (addedItem) {
      trackMetaAddToCart([cartItemToMetaLineItem(addedItem)], { page_path: "/services/google-business" });
    }
    setTimeout(() => {
      setIsAdding(false);
      push("/cart");
    }, 250);
  };

  return (
    <div ref={pageRootRef} className="pt-16 pb-12 md:pt-20 md:pb-16">
      <ServiceDetailHero
        badgeIcon={<MapPin className="h-4 w-4" />}
        badgeText="Достигни до повече клиенти с Google Maps"
        title={
          <>
            Професионален Google Бизнес Профил
            <div className="gradient-text">Излез пред конкуренцията</div>
          </>
        }
        description={
          <>
            Направи така, че клиентите в твоя град да намират първо теб. Изграждаме и
            оптимизираме твоя бизнес профил в Google на еднократна, фиксирана цена.
          </>
        }
        priceSlot={<Price value={planPrice} className="text-3xl sm:text-4xl text-primary" />}
        primaryLabel="Купи сега"
        onPrimaryClick={() => {
          trackCtaClick("/services/google-business", "service_google_business_scroll_to_buy");
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
              Защо губиш клиенти, ако те няма в Google Maps?
            </h2>
            <p
              data-animate-reveal
              className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
            >
              Хората търсят услуги около тях всеки ден. Ако не те виждат, отиват при съседа.
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
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
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
              Какво е включено в пакета "Google Профил"?
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
                  <p className="text-muted-foreground leading-relaxed">{item}</p>
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
              Как да стартираш? (Само 3 лесни стъпки)
            </h2>
            <p
              data-animate-reveal
              className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
            >
              Улеснили сме процеса, за да не губиш излишно време в технически детайли.
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
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
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
              Събрахме най-честите въпроси, за да вземеш решение по-бързо и уверено.
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
        description="Избери добавки и добави услугата в кошницата."
        price={planPrice}
        upsells={upsells}
        onUpsellsChange={setUpsells}
        onAddToCart={handleGoogleCheckout}
        isAdding={isAdding}
        ctaId="service_google_business_buy_section_add_to_cart"
        ctaPage="/services/google-business"
      />

    </div>
  );
}
