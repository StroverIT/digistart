"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleX,
  ClipboardList,
  MonitorCheck,
  Phone,
  Rocket,
  ShoppingCart,
  Smartphone,
} from "lucide-react";
import TransitionLink from "@/components/transitions/TransitionLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { addToCart, CART_DUPLICATE_SERVICE_MESSAGE } from "@/lib/store/cart";
import { toast } from "sonner";
import type { CartItemUpsell, Service } from "@/lib/types";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { ServiceBuySection } from "@/components/services/service-buy-section";

const MARKETING_START_PRICE = 200;

const marketingPainPoints = [
  {
    title: "Нямаш време за качествено съдържание",
    text: "Писането на текстове, правенето на дизайни и монтирането на Reels отнема часове. Накрая публикуваш нещо набързо, което не носи резултат.",
  },
  {
    title: "Органичният обхват не стига",
    text: "Дори с хубави постове, без правилно настроени реклами в Meta, Google и TikTok достигаш до твърде малко хора и растежът спира.",
  },
  {
    title: "Хаос и липса на стратегия",
    text: "Публикуваш хаотично без ясен план. Това обърква аудиторията и създава непрофесионално впечатление, което отблъсква купувачите.",
  },
] as const;

const marketingSolutionItems = [
  "Органично съдържание (Meta & TikTok): Създаване и публикуване на ангажиращи постове, каросели, сторита и Reels.",
  "Професионален Copywriting & Дизайн: Продаващи текстове и визии, съобразени с бранда и актуалните трендове.",
  "Управление на платени реклами: Настройка и оптимизация на кампании във Facebook, Instagram, Google Ads и TikTok.",
  "Инсталиране на тракинг (Pixel/Analytics): Свързване на платформите със сайта за точно проследяване на резултатите.",
  "Месечен план (Content Calendar): Ясен график какво, кога и къде ще бъде публикувано.",
  "Анализ и отчет: Всеки месец получаваш ясна справка за нови клиенти, продажби и растеж на профилите.",
] as const;

const marketingSteps = [
  {
    title: "Стъпка 1: Поръчка онлайн",
    text: "Избираш маркетинговия пакет и плащаш еднократно за първоначалната настройка. Край на неясните агенционни хонорари.",
    icon: ShoppingCart,
  },
  {
    title: "Стъпка 2: Кратка консултация (до 15 мин)",
    text: "Уточняваме гласа на бранда, ключовите продукти/услуги, идеалния клиент и бюджета за платена реклама.",
    icon: Phone,
  },
  {
    title: "Стъпка 3: Демо версия на стратегията",
    text: "Изготвяме първоначален месечен план за постове, текстове, Reels идеи и рекламни стратегии за преглед и одобрение.",
    icon: MonitorCheck,
  },
  {
    title: "Стъпка 4: Всичко е активно",
    text: "Стартираме органичното съдържание и платените реклами. Профилите ти започват да работят за теб 24/7.",
    icon: Rocket,
  },
] as const;

interface ServiceDetailSocialMediaProps {
  service: Service;
}

export function ServiceDetailSocialMedia({ service }: ServiceDetailSocialMediaProps) {
  const { push } = useTransitionRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [upsells, setUpsells] = useState<CartItemUpsell[]>([]);

  const scrollToBuySection = () => {
    document.getElementById("buy-now")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleMarketingCheckout = () => {
    setIsAdding(true);
    const result = addToCart(service.id, service.options[0].id, upsells);
    if (!result.added) {
      setIsAdding(false);
      if (result.reason === "duplicate") {
        toast(CART_DUPLICATE_SERVICE_MESSAGE);
      }
      return;
    }
    setTimeout(() => {
      setIsAdding(false);
      push("/cart");
    }, 250);
  };

  return (
    <div className="pt-20 pb-28 md:pb-16">
      <section className="relative overflow-hidden pt-10 pb-14 md:pt-14 md:pb-18">
        <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl animate-pulse delay-1000" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="container relative z-10 mx-auto px-4">
          <TransitionLink
            href="/#services"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            Към услугите
          </TransitionLink>

          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Smartphone className="h-4 w-4" />
              Пълно дигитално присъствие
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl leading-tight text-balance">
              Управление на Социални Мрежи и Реклама
              <div className="gradient-text">Ние поемаме контрола, ти броиш продажбите</div>
            </h1>
            <p className="mt-5 max-w-3xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Забрави за стреса от постоянното мислене какво да публикувам днес. Ние създаваме
              грабващи Reels, сторита и постове, и управляваме печеливши реклами в Meta, Google
              и TikTok. Всичко на една ясна, фиксирана цена.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <Price
                value={MARKETING_START_PRICE}
                className="text-3xl sm:text-4xl text-primary"
              />
              <span className="text-muted-foreground">/месец</span>
              <Button
                onClick={scrollToBuySection}
                size="lg"
                className="h-14 px-8 text-lg bg-orange-500 hover:bg-orange-600 text-white"
              >
                Купи сега
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-3 block">
              Проблемът
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance">
              Защо хубавият сайт не стига, ако няма кой да го види?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Да управляваш бизнес и да си маркетолог едновременно е невъзможно.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {marketingPainPoints.map((item) => (
              <Card
                key={item.title}
                className="group bg-card border-border hover:border-destructive/50 transition-all duration-300"
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

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-3 block">
              Решението
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">
              Какво е включено в пакета "Социални Мрежи"?
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {marketingSolutionItems.map((item) => (
              <Card
                key={item}
                className="group border-border bg-card hover:border-primary/50 transition-all duration-300"
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

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-3 block">
              Процес
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance">
              Как да стартираме кампаниите? (Само 4 лесни стъпки)
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Ние поемаме тежката работа, за да можеш да се фокусираш върху бизнеса си.
            </p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-border to-transparent -translate-y-1/2" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {marketingSteps.map((step, index) => (
                <div key={step.title} className="relative">
                  <Card className="group bg-card border-border hover:border-primary/50 transition-colors h-full">
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

      <ServiceBuySection
        service={service}
        title="Купи сега"
        description="Конфигурирай плана и добави услугата в кошницата."
        price={MARKETING_START_PRICE}
        monthlyLabel="/месец"
        upsells={upsells}
        onUpsellsChange={setUpsells}
        onAddToCart={handleMarketingCheckout}
        isAdding={isAdding}
      />

      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur px-4 py-3">
        <div className="mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Пакет "Социални Мрежи"</p>
            <Price value={MARKETING_START_PRICE} className="font-semibold" />
            <p className="text-xs text-muted-foreground">/мес.</p>
          </div>
          <Button
            onClick={handleMarketingCheckout}
            disabled={isAdding}
            className="min-h-11 min-w-30 shrink-0 px-4 text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isAdding ? "Добавяне..." : "Добави в кошницата"}
          </Button>
        </div>
      </div>
    </div>
  );
}
