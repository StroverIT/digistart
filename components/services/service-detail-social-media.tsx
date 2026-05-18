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
    title: "Страхотна идея, нулев трафик",
    text: "Създаваш качествени неща, но ги виждат само малцина. Клиентите купуват от големите платформи просто защото не знаят, че твоят бранд съществува.",
  },
  {
    title: "Роб на съобщенията",
    text: "Губиш ценни часове всеки ден, за да отговаряш на едни и същи въпроси в чата. Работиш като оператор, вместо да развиваш бизнеса си.",
  },
  {
    title: "Хронична липса на време",
    text: "Изработката, опаковането, доставките и основната работа изяждат деня ти. Поддръжката на социалните мрежи винаги остава „за утре“.",
  },
  {
    title: "Рекламите те плашат",
    text: "Чуваш за огромни суми, изхвърлени на вятъра във Facebook. Страхуваш се да инвестираш в реклама, защото не знаеш как да я настроиш така, че да донесе възвръщаемост.",
  },
  {
    title: "Профилът ти не излъчва доверие",
    text: "Разпокъсани снимки и хаотични публикации те карат да изглеждаш по-малък, отколкото си. Потребителите се колебаят и отиват при по-лъскавите конкуренти.",
  },
] as const;

const marketingSolutionItems = [
  "Магнетично съдържание: Получаваш професионална поддръжка на 1 канал с 2 качествени публикации всяка седмица. Превръщаме суровите ти идеи в постове, които грабват вниманието.",
  "Текстове, които продават (Copywriting): Не просто красиви картинки, а ясни послания, които обясняват защо клиентът трябва да избере точно твоя продукт пред този на конкуренцията.",
  "Предвидимост и стратегия: Край на импровизациите. Знаеш точно какво и кога ще се публикува благодарение на предварително изграден план.",
  "Реклами, които носят оборот (Опция): Настройваме и управляваме рекламни кампании (дори с малък бюджет от €50 на месец). Таргетираме точните хора, за да генерираме реални поръчки.",
  "Чатбот автоматизация (Опция): Настройваме автоматизирани отговори. Системата отговаря на клиентите вместо теб, докато ти твориш или почиваш.",
] as const;

const marketingSteps = [
  {
    title: "Стартираш с базов пакет",
    text: "За €200/месец получаваш поддръжка на 1 канал, 2 качествени публикации седмично и ясна стратегия — без агенция за хиляди левове.",
    icon: ShoppingCart,
  },
  {
    title: "Ти създаваш, ние публикуваме",
    text: "Пращаш сурови кадри и видеа с телефона. Ние ги обработваме, пишем продаващи текстове и публикуваме по предварителен план.",
    icon: Smartphone,
  },
  {
    title: "Резултат с желязна гаранция",
    text: "Изграждаме доверие и (по избор) пускаме реклами. Ако до 1 месец нямаш реализирана продажба — връщаме 100% от сумата за нашата услуга.",
    icon: Rocket,
  },
] as const;

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "1. Включен ли е бюджетът за реклама в месечната такса?",
    answer:
      "Не. Базовият пакет от €200/месец покрива създаването на съдържанието, текстовете и стратегията. Ако избереш „Управление на реклами“ (+ €150/мес.), ти определяш рекламния бюджет към платформите (минимум €50/месец на канал), който се изтегля директно от твоята карта.",
  },
  {
    question: "2. Трябва ли да имам професионални снимки?",
    answer:
      "Не е задължително. Можеш да ни пращаш сурови кадри и кратки видеа, заснети с телефон. Ние ги обработваме, добавяме трендинг звук, графики и ги превръщаме в завладяващо и професионално съдържание.",
  },
  {
    question: "3. Гарантирате ли продажби?",
    answer:
      "Да! Нашата цел е твоят растеж, затова предлагаме желязна гаранция: ако до 1 месец нямаш реализирана продажба от нашата работа, ти връщаме 100% от сумата за нашата услуга.",
  },
  {
    question: "4. Вие ли ще отговаряте на съобщенията (DMs)?",
    answer:
      "В базовия пакет ние се грижим за модерирането на коментарите. За да се освободиш напълно от отговарянето на повтарящи се въпроси в чата, предлагаме еднократна настройка на чатбот за €59, който поема комуникацията.",
  },
  {
    question: "5. Запазвам ли контрол над профилите си?",
    answer:
      "Напълно. Профилите остават твоя собственост. Ние просто получаваме достъп като администратори, за да можем да публикуваме съдържанието и да управляваме кампаниите.",
  },
  {
    question: "6. Обвързвам ли се с дългосрочни договори?",
    answer:
      "Не. Услугата е изцяло на месечен абонамент. Можеш да я паузираш или прекратиш с предизвестие преди началото на следващия месец. Вярваме в резултатите, не в обвързващите клаузи.",
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
          badgeText="Привлечи клиенти с минимален бюджет"
          title={
            <>
              Социални мрежи, които продават
              <div className="gradient-text">
                Професионална визия и реални клиенти без хиляди левове за агенции
              </div>
            </>
          }
          description={
            <>
              Срещу €200 на месец превръщаме профила ти в магнит за поръчки. Ние поемаме
              създаването на съдържанието, писането на текстовете и цялостната стратегия, за да
              можеш ти да се фокусираш върху бизнеса си. Изграждаме доверие у аудиторията и
              стартираме с желязна гаранция за резултат.
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
          primaryLabel="Увеличи продажбите си сега"
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
                Лайковете не плащат сметките
              </span>
              <h2
                data-animate-reveal
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance opacity-0 translate-y-10"
              >
                Имаш страхотен продукт, но губиш време в хаос и клиентите избират други.
              </h2>
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
                Маркетинг, който работи за теб
              </span>
              <h2
                data-animate-reveal
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance opacity-0 translate-y-10"
              >
                Какво се случва, когато повериш онлайн присъствието си на професионалисти?
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
                Ти създаваш продукта — ние водим клиентите
              </span>
              <h2
                data-animate-reveal
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance opacity-0 translate-y-10"
              >
                Привлечи клиенти и генерирай трафик
              </h2>
              <p
                data-animate-reveal
                className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
              >
                С желязна гаранция за резултат — само 3 лесни стъпки.
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
                Всичко, което трябва да знаеш, преди да ни повериш социалните си мрежи.
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
          monthlyLabel="/месец"
          upsells={upsells}
          onUpsellsChange={setUpsells}
          onAddToCart={handleMarketingCheckout}
          isAdding={isAdding}
          cartSelectedOptionId={service.options[0]?.id}
          ctaId="service_social_media_buy_section_add_to_cart"
          ctaPage="/services/social-media"
        />

        <PlansSection
          compact
          className="py-12 md:py-16"
        />
      </div>
    </div>
  );
}
