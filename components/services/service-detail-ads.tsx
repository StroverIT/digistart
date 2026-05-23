"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CheckCircle2,
  CircleX,
  ClipboardList,
  Megaphone,
  Rocket,
  ShoppingCart,
  Target,
} from "lucide-react";
import {
  cartItemToMetaLineItem,
  trackMetaAddToCart,
} from "@/lib/analytics/meta-pixel";
import { trackCtaClick } from "@/lib/analytics/tracker";
import { Card, CardContent } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { ADS_SOCIAL_MEDIA_COMPANION } from "@/lib/data/service-companions";
import { addOrUpdateServiceInCart } from "@/lib/store/cart";
import type { CartItemUpsell, Service } from "@/lib/types";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { ServiceBuySection } from "@/components/services/service-buy-section";
import { getServicePlanPrice } from "@/lib/data/services";
import { Faq, type FaqItem } from "@/components/ui/faq";
import { PlansSection } from "@/components/plans/plans-section";
import { ServiceDetailHero } from "@/components/services/service-detail-hero";
import { ServicePageBackground } from "@/components/services/service-page-background";
import { ServiceSectionBuyCta } from "@/components/services/service-section-buy-cta";
import { SocialProofSection } from "@/components/home/social-proof-section";

gsap.registerPlugin(ScrollTrigger);

const ADS_HERO_PRIMARY_CTA = "Стартирай реклами с увереност" as const;

const adsPainPoints = [
  {
    title: "Хвърляш пари без възвръщаемост",
    text: "Пускаш реклами на сляпо и не разбираш защо бюджетът изчезва, а поръчките не идват. Без структура всеки месец е лотария.",
  },
  {
    title: "Страх от сложните настройки",
    text: "Facebook Ads Manager изглежда като космически кораб. Отлагаш старта, защото се страхуваш да сгрешиш таргетирането или креативите.",
  },
  {
    title: "Няма какво да рекламираш",
    text: "Профилът ти е празен или нередовен — рекламата води към страница, която не вдъхва доверие. Кликовете не се превръщат в продажби.",
  },
  {
    title: "Губиш време в оптимизация",
    text: "Вместо да управляваш бизнеса, гледаш статистики и тестваш обяви без ясна стратегия. Резултатът е изтощение, не растеж.",
  },
  {
    title: "Конкурентите те изпреварват",
    text: "Докато ти се колебаеш, другите вече купуват видимост пред твоите клиенти. Губиш пазарен дял всеки ден.",
  },
] as const;

const adsSolutionItems = [
  "Стратегия и настройка: Създаваме кампании с ясна цел — заявки, съобщения или продажби — според твоя бизнес.",
  "Таргетиране към правилните хора: Намираме аудиторията, която реално купува, вместо да хвърляш бюджет на всички.",
  "Оптимизация всеки месец: Следим резултатите, спираме слабите обяви и увеличаваме работещите.",
  "Прозрачност: Знаеш какво плащаш за управление и какво — за бюджет към платформите (минимум €50/месец на канал).",
  "Съдържание за рекламите (опция): Комбинирай с базов пакет социални мрежи — профилът ти да изглежда готов, когато клиентът кликне.",
] as const;

const adsSteps = [
  {
    title: "Избираш канали и бюджет",
    text: "Започваш с €150/месец управление на канал + минимум €50 рекламен бюджет към платформата. Ти определяш колко да инвестираш.",
    icon: ShoppingCart,
  },
  {
    title: "Ние настройваме и пускаме",
    text: "Създаваме кампании, креативи и таргети. Ти одобряваш или ни даваш материали — без да влизаш в Ads Manager всеки ден.",
    icon: Target,
  },
  {
    title: "Растеж с отчети",
    text: "Получаваш ясна картина какво работи. По желание добавяш съдържание в профила чрез услугата „Социални мрежи“.",
    icon: Rocket,
  },
] as const;

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "1. Включен ли е рекламният бюджет в цената?",
    answer:
      "Не. €150/месец на канал е за нашето управление и оптимизация. Бюджетът към Facebook/Instagram (минимум €50/месец на канал) се плаща директно от твоята карта към платформата.",
  },
  {
    question: "2. Трябва ли да имам готов профил и съдържание?",
    answer:
      "Препоръчително е профилът да изглежда активен. Ако нямаш редовни публикации, комбинирай с базовия пакет „Социални мрежи“ — можеш да го добавиш при поръчка.",
  },
  {
    question: "3. Гарантирате ли продажби от рекламите?",
    answer:
      "Рекламите зависят от продукта, офертата и бюджета. Нашата задача е професионална настройка и оптимизация. При комбинация със социални мрежи и нашата гаранция за съдържание — имаш по-силен стек за растеж.",
  },
  {
    question: "4. Колко канала мога да управлявам?",
    answer:
      "Базово е 1 канал. В секцията „Купи сега“ можеш да добавиш допълнителни канали — €150/месец управление на канал.",
  },
  {
    question: "5. Мога ли да спра по всяко време?",
    answer:
      "Да. Услугата е месечен абонамент без дългосрочен договор. Спираш с предизвестие преди следващия месечен цикъл.",
  },
];

interface ServiceDetailAdsProps {
  service: Service;
}

export function ServiceDetailAds({ service }: ServiceDetailAdsProps) {
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

  const handleAdsCheckout = (options?: { includeCompanion?: boolean }) => {
    setIsAdding(true);
    const optionId = service.options[0].id;
    const result = addOrUpdateServiceInCart(service.id, optionId, upsells, {
      includeCompanion: options?.includeCompanion,
      companionServiceId: ADS_SOCIAL_MEDIA_COMPANION.serviceId,
      companionOptionId: ADS_SOCIAL_MEDIA_COMPANION.optionId,
    });
    if (!result.added) {
      setIsAdding(false);
      return;
    }
    const addedItem = result.cart.items.find(
      (i) => i.serviceId === service.id && i.selectedOptionId === optionId,
    );
    if (addedItem) {
      trackMetaAddToCart([cartItemToMetaLineItem(addedItem)], {
        page_path: "/services/ads",
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
          badgeIcon={<Megaphone className="h-4 w-4" />}
          badgeText="Платени кампании с ясна стратегия"
          title={
            <>
              Реклами, които достигат
              <div className="gradient-text">до готови да купят клиенти</div>
            </>
          }
          description={
            <>
              Настройваме и управляваме Facebook и Instagram реклами с фокус върху
              заявки и продажби. Ти задаваш бюджета, ние поемаме техническата част и
              оптимизацията.
            </>
          }
          priceSlot={
            <div className="flex items-baseline gap-2">
              <span className="text-muted-foreground text-lg">от</span>
              <Price
                value={planPrice}
                className="text-3xl sm:text-4xl text-primary"
              />
              <span className="text-muted-foreground">/месец</span>
            </div>
          }
          primaryLabel={ADS_HERO_PRIMARY_CTA}
          onPrimaryClick={() => {
            trackCtaClick("/services/ads", "service_ads_scroll_to_buy");
            scrollToBuySection();
          }}
          backCtaId="service_ads_back_to_services"
        />

        <section data-animate-section className="py-8 md:py-20 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
              <span
                data-animate-reveal
                className="text-primary font-semibold text-sm uppercase tracking-wider mb-3 block opacity-0 translate-y-10"
              >
                Бюджет без резултат
              </span>
              <h2
                data-animate-reveal
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance opacity-0 translate-y-10"
              >
                Рекламите те плашат, а конкурентите вече купуват твоите клиенти
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {adsPainPoints.map((item) => (
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
                pagePath="/services/ads"
                ctaId="service_ads_section_pain_scroll_buy"
                label={ADS_HERO_PRIMARY_CTA}
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
                Реклами с контрол
              </span>
              <h2
                data-animate-reveal
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance opacity-0 translate-y-10"
              >
                Какво получаваш с нашето управление на реклами?
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {adsSolutionItems.map((item) => (
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
                pagePath="/services/ads"
                ctaId="service_ads_section_solution_scroll_buy"
                label={ADS_HERO_PRIMARY_CTA}
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
                От бюджет към заявки
              </span>
              <h2
                data-animate-reveal
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance opacity-0 translate-y-10"
              >
                Стартирай реклами в 3 стъпки
              </h2>
            </div>
            <div className="relative">
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-border to-transparent -translate-y-1/2" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {adsSteps.map((step, index) => (
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
                    {index < adsSteps.length - 1 && (
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
                pagePath="/services/ads"
                ctaId="service_ads_section_steps_scroll_buy"
                label={ADS_HERO_PRIMARY_CTA}
              />
            </div>
          </div>
        </section>

        <SocialProofSection type="social-media" />

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
                pagePath="/services/ads"
                ctaId="service_ads_section_faq_scroll_buy"
                label={ADS_HERO_PRIMARY_CTA}
              />
            </div>
          </div>
        </section>

        <ServiceBuySection
          service={service}
          title="Купи сега"
          price={planPrice}
          monthlyLabel="/месец"
          upsells={upsells}
          onUpsellsChange={setUpsells}
          onAddToCart={handleAdsCheckout}
          isAdding={isAdding}
          cartSelectedOptionId={service.options[0]?.id}
          companion={ADS_SOCIAL_MEDIA_COMPANION}
          ctaId="service_ads_buy_section_add_to_cart"
          ctaPage="/services/ads"
        />

        <PlansSection compact className="py-12 md:py-16" />
      </div>
    </div>
  );
}
