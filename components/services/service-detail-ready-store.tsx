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
  Facebook,
  Instagram,
  Rocket,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { addToCart, findCartItemByService, updateCartItemUpsells } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { ServiceBuySection } from "@/components/services/service-buy-section";
import { getServiceById, getServicePlanPrice } from "@/lib/data/services";
import type { CartItemUpsell, Service } from "@/lib/types";
import { Faq, type FaqItem } from "@/components/ui/faq";
import Link from "next/link";
import { PlansSection } from "@/components/plans/plans-section";
import { ServiceDetailHero } from "@/components/services/service-detail-hero";
import { TemplatesShowcaseSection } from "@/components/templates/templates-showcase-section";

gsap.registerPlugin(ScrollTrigger);

const SERVICE_ID = "ready-store";
const OPTION_ID = "subscription";

const HERO_DESCRIPTION_INTRO =
  "Получаваш професионален онлайн магазин на цената на една вечеря (от €20/месец).";
const HERO_DESCRIPTION_DETAIL_P1 =
  "Ние поемаме цялата техническа част - от хостинга до интеграциите с куриери. Ти просто качваш продуктите си и започваш да продаваш в цяла България.";
const HERO_DESCRIPTION_DETAIL_P2 =
  "Без да плащаш хиляди левове на агенции, без да учиш програмиране и без да чакаш с месеци. Старт ДО 48 часа с 14-дневна гаранция за връщане на средствата.";
const HERO_DETAIL_HIGHLIGHTS = [
  "(от €20/месец)",
  "Старт след 24-48 часа",
  "14-дневна гаранция за връщане на средствата",
  "в цяла България",
] as const;
const PAIN_POINTS = [
  {
    title: "Огромната финансова бариера",
    text: "Офертите за изработка на онлайн магазин масово започват от 1500–3000 лв., което е огромен и неоправдан риск за стартиращ бизнес или страничен проект.",
  },
  {
    title: "Роб на съобщенията (Чата)",
    text: "Продаваш през Instagram или Facebook, но губиш часове всеки ден да отговаряш за цени, да мериш размери и да следиш кой какво е поръчал. Работиш като оператор, вместо да развиваш бранда си.",
  },
  {
    title: "Ръчна логистика и хаос",
    text: "Всяка вечер преписваш адреси на ръка в системата на Еконт или Спиди за няколко поръчки. Искаш да растат продажбите, но си достигнал лимита на времето си.",
  },
  {
    title: "Техническата сложност (ИТ парализа)",
    text: "Искаш сайт, но платформи като WordPress те объркват. Думи като хостинг, плъгини и сървъри те отказват да започнеш, а опитите да се справиш сам завършват със счупен сайт.",
  },
  {
    title: "Скритите такси",
    text: "Някои чуждестранни платформи изглеждат евтини в началото, но после изискват скъпи месечни плащания за базови неща като интеграция с български куриери и плащания.",
  },
] as const;

const SOLUTION_ITEMS = [
  'Готов за продажби магазин: Без месеци чакане и без хиляди левове "заровени" в нетестван проект. Стартираш с премиум изглед, който веднага изгражда доверие у клиентите ти и те отличава като професионалист.',
  "Машина за поръчки 24/7: Клиентите избират, купуват и плащат сами. Поръчките влизат, докато спиш или си на основната си работа. Край на хаоса със съобщенията - ти само получаваш известие и изпращаш стоката.",
  "Автоматични товарителници: С 1 клик генерираш товарителници за Еконт и Спиди директно от системата. Без повече преписване на имена и телефони на ръка.",
  "Готов за реклама (Вграден Meta Pixel): Магазинът идва с вграден Meta Pixel. Системата е настроена да следи кой какво купува, за да пускаш печеливши реклами, когато си готов да мащабираш продажбите си.",
  "Нулева поддръжка от твоя страна: Ние се грижим сайтът да е бърз, защитен и винаги онлайн. Не се занимаваш с технически бъгове, а се фокусираш само върху създаването на продукти.",
] as const;

const RESTYLED_CASE = {
  story:
    "Restyled създават страхотна мода, но губеха часове всеки ден в отговаряне на съобщения за размери, цени и адреси за доставка. Изградихме им бърз, фокусиран към мобилни устройства магазин.",
  result:
    "Днес клиентите им пазаруват сами, денонощно. Restyled изглеждат като премиум марка онлайн, а собствениците имат време да се фокусират върху новите си колекции, вместо да работят като оператори в чата.",
  website: "https://restyled.bg",
  facebook: "https://www.facebook.com/profile.php?id=61582055477324",
  instagram: "https://www.instagram.com/restyled_bg/",
} as const;

const STEPS = [
  {
    title: "Избираш базов абонамент (Ден 1)",
    body: "Срещу €20/месец получаваш онлайн платформата си. Никакви хиляди левове инвестиция. Ние подготвяме темплейта и основата.",
    icon: ShoppingCart,
  },
  {
    title: "Добавяш интеграции с 1 клик (Ден 1)",
    body: "Искаш плащане с карта? Добавяш го. Искаш автоматични товарителници за Еконт и Спиди? Включваш ги. Ние навързваме системите, за да не се налага ти да го правиш.",
    icon: Zap,
  },
  {
    title: "Готов за продажби (Ден 2)",
    body: "До 48 часа магазинът ти е онлайн. Ти качваш продуктите си в лесен панел на български и започваш да продаваш в цялата страна. Тестваш без риск с 14-дневна гаранция.",
    icon: Rocket,
  },
] as const;

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Трябва ли ми голям бюджет, за да започна?",
    answer:
      "Не! Нашият MVP (Minimum Viable Product) модел ти позволява да стартираш онлайн магазин за едва €20 на месец. Не инвестираш хиляди левове предварително и ако решиш, че идеята ти не работи, просто спираш абонамента без загуби.",
  },
  {
    question: "Колко време отнема настройката на онлайн магазина?",
    answer:
      "От регистрацията до готовността за първа поръчка минават под 48 часа (1-2 работни дни). Без дълги срещи с агенции и без чакане с месеци.",
  },
  {
    question: "Трябват ли ми технически умения, за да управлявам магазина?",
    answer:
      "Абсолютно не. Ние настройваме цялата инфраструктура. Управлението на твоя магазин (качване на снимки, промяна на цени) става през интуитивен панел на български и е толкова лесно, колкото да качиш пост във Facebook.",
  },
  {
    question: "Какви продукти мога да продавам?",
    answer:
      "Всичко, от което имаш бизнес идея: дрехи, ръчно изработени изделия (handmade), козметика, странични проекти (side-hustles) или дори дигитални продукти.",
  },
  {
    question: "Колко продукта мога да добавя в магазина?",
    answer:
      "Неограничен брой. Системата няма таван. Ти управляваш каталога си напълно самостоятелно.",
  },
  {
    question: "Как клиентите ще плащат за поръчките си?",
    answer:
      "Магазинът ти може да приема класическия Наложен платеж, както и сигурни плащания с дебитни/кредитни карти чрез интеграция със Stripe срещу минимална добавка от €10/месец.",
  },
  {
    question: "Трябва ли ръчно да пиша товарителници за Еконт и Спиди?",
    answer:
      "Край на ръчното писане! При добавяне на интеграция с куриер (+ €5/месец) системата ни автоматично генерира товарителници с 1 клик, което ще ти спести безброй часове.",
  },
  {
    question: "Магазинът ми готов ли е за реклама във Facebook и Instagram?",
    answer:
      "Да. Във всеки базов абонамент е включен вграден Meta Pixel, който позволява да следиш поведението на клиентите и да пускаш оптимизирани реклами, когато си готов да скалираш продажбите.",
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
    const existing = findCartItemByService(SERVICE_ID, OPTION_ID);
    if (existing) {
      updateCartItemUpsells(existing.id, upsells);
      setIsAdding(false);
      return;
    }
    const result = addToCart(SERVICE_ID, OPTION_ID, upsells);
    if (!result.added) {
      setIsAdding(false);
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
        badgeText="Без хиляди левове първоначална инвестиция. Без ИТ екип. Само чисти продажби."
        title={
          <>
            Превърни идеята или проекта си в автоматизиран онлайн магазин -{" "}
            <div className="gradient-text">бързо, лесно и без финансов риск.</div>
          </>
        }
        description={HERO_DESCRIPTION_INTRO}
        priceSlot={
          <div className="flex items-baseline gap-1">
            <Price
              value={planPrice}
              className={cn(
                headingFontClass,
                "text-3xl sm:text-4xl text-primary"
              )}
            />
            <span className="text-muted-foreground text-lg">/мес</span>
          </div>
        }
        primaryLabel="Стартирай своя онлайн магазин без риск"
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
              Защо губиш време и продажби
            </span>
            <h2
              data-animate-reveal
              className={cn(
                headingFontClass,
                "text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance opacity-0 translate-y-10",
              )}
            >
              Идеята ти е супер, но хаосът със съобщенията и техническите бариери те спират.
            </h2>
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
              Автоматизиран бизнес, не просто сайт
            </span>
            <h2
              data-animate-reveal
              className={cn(
                headingFontClass,
                "text-3xl sm:text-4xl md:text-5xl font-bold text-balance opacity-0 translate-y-10",
              )}
            >
              Какво получаваш, когато оставиш техническата част на нас?
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
              До ключ - без технически умения
            </span>
            <h2
              data-animate-reveal
              className={cn(
                headingFontClass,
                "text-3xl sm:text-4xl md:text-5xl font-bold text-balance opacity-0 translate-y-10",
              )}
            >
              От нула до онлайн канал за цяла България за 3 стъпки
            </h2>
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
              От хаос в съобщенията до подреден бизнес: Историята на Restyled
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
                <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 block">
                  Онлайн магазин · Fashion
                </span>
                <h3 className={cn(headingFontClass, "text-2xl sm:text-3xl md:text-4xl mb-4 text-balance")}>
                  Restyled
                </h3>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-4">
                  {RESTYLED_CASE.story}
                </p>
                <p className="text-foreground text-base sm:text-lg leading-relaxed font-medium">
                  {RESTYLED_CASE.result}
                </p>
              </div>

              <div
                data-animate-reveal
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 opacity-0 translate-y-10"
              >
                <TrackedCtaLink
                  href={RESTYLED_CASE.website}
                  ctaId="service_ready_store_restyled_store"
                  className="inline-flex items-center gap-2 text-primary text-base sm:text-lg font-medium group"
                  _blank={true}
                >
                  Виж онлайн магазина
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </TrackedCtaLink>
                <div className="flex items-center gap-3">
                  <Link
                    href={RESTYLED_CASE.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                    aria-label="Restyled във Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </Link>
                  <Link
                    href={RESTYLED_CASE.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                    aria-label="Restyled в Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        data-animate-section
        className="relative overflow-hidden py-12 md:py-20"
      >
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-background to-primary/5" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <p
              data-animate-reveal
              className="text-base sm:text-lg text-foreground leading-relaxed opacity-0 translate-y-10"
            >
              {HERO_DESCRIPTION_DETAIL_P1}
            </p>
            <p
              data-animate-reveal
              className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed opacity-0 translate-y-10"
            >
              {HERO_DESCRIPTION_DETAIL_P2}
            </p>
            <div
              data-animate-reveal
              className="mt-4 flex flex-wrap justify-center gap-2 pt-1 opacity-0 translate-y-10"
            >
              {HERO_DETAIL_HIGHLIGHTS.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PlansSection
        compact
        title="Готови абонаментни пакети"
        subtitle="Или конфигурирай само магазина и добавките, които са ти нужни сега."
        className="py-12 md:py-16 bg-card/30"
      />

      {service ? (
        <ServiceBuySection
          service={service}
          title="Купи сега"
          description="Избери абонамент и добавки според етапа на бизнеса, след което добави в кошницата."
          price={planPrice}
          upsells={upsells}
          onUpsellsChange={setUpsells}
          onAddToCart={handleCheckout}
          isAdding={isAdding}
          cartSelectedOptionId={OPTION_ID}
          ctaId="service_ready_store_buy_section_add_to_cart"
          ctaPage="/services/online-store"
        />
      ) : null}

      <TemplatesShowcaseSection headingFontClass={headingFontClass} />

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

    </div>
  );
}
