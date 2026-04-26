"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleX,
  ClipboardList,
  Clock,
  Globe,
  MapPin,
  MonitorCheck,
  Phone,
  Rocket,
  Share2,
  ShoppingCart,
  Smartphone,
  Zap,
} from "lucide-react";
import TransitionLink from "@/components/transitions/TransitionLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { PricingConfigurator } from "@/components/services/pricing-configurator";
import { addToCart } from "@/lib/store/cart";
import { services } from "@/lib/data/services";
import type { Service } from "@/lib/types";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";

const iconMap: Record<string, ReactNode> = {
  Globe: <Globe className="h-12 w-12" />,
  ShoppingCart: <ShoppingCart className="h-12 w-12" />,
  MapPin: <MapPin className="h-12 w-12" />,
  Share2: <Share2 className="h-12 w-12" />,
};

interface ServiceDetailWithConfiguratorProps {
  service: Service;
}

const GOOGLE_PROFILE_PRICE = 149;
const GOOGLE_PROFILE_OPTION_ID = "basic";
const MARKETING_START_PRICE = 250;

const googlePainPoints = [
  {
    title: "Невидим си за локални търсения",
    text: "Когато някой търси услуга + твоя град, Google показва първо бизнесите с официален профил и карта. Ако го нямаш, ти просто липсваш от екрана им.",
  },
  {
    title: "Губиш доверие без отзиви (ревюта)",
    text: "90% от клиентите четат отзиви преди да посетят място или да купят. Без Google профил нямаш официално място, където доволните клиенти да градят репутацията ти.",
  },
  {
    title: "Трудна комуникация",
    text: "Без профил клиентите трябва да ровят, за да намерят телефона ти. С оптимизиран Google профил имат бърз бутон Обади се и Упътване директно на телефона си.",
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
    title: "Стъпка 2: Кратка консултация (до 15 мин)",
    text: "Чуваме се за кратко, за да уточним адреса, работното време, контактите и услугите, които искаш да акцентираме.",
    icon: Phone,
  },
  {
    title: "Стъпка 3: Демо версия и настройка",
    text: "Изграждаме профила с всички данни, снимки и ключови думи. Преглеждаш го, за да потвърдиш, че отговаря на нуждите ти.",
    icon: MonitorCheck,
  },
  {
    title: "Стъпка 4: Официално в Google",
    text: "Завършваме верификацията и профилът ти е публичен. Вече си на картата и готов да събираш ревюта и обаждания.",
    icon: Rocket,
  },
] as const;

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

export function ServiceDetailWithConfigurator({
  service,
}: ServiceDetailWithConfiguratorProps) {
  const { push } = useTransitionRouter();
  const [isAdding, setIsAdding] = useState(false);


  const handleGoogleCheckout = () => {
    setIsAdding(true);
    addToCart(service.id, GOOGLE_PROFILE_OPTION_ID, []);
    setTimeout(() => {
      setIsAdding(false);
      push("/кошница");
    }, 250);
  };

  if (service.id === "google-business") {
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
              href="/#услуги"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              Към услугите
            </TransitionLink>

            <div className="max-w-4xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <MapPin className="h-4 w-4" />
                Бъди първи в Google Maps
              </span>
              <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-balance">
                Професионален Google Бизнес Профил.{" "}
                <span className="gradient-text">Излез пред конкуренцията.</span>
              </h1>
              <p className="mt-5 max-w-3xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Направи така, че клиентите в твоя град да намират първо теб. Изграждаме и
                оптимизираме твоя бизнес профил в Google на еднократна, фиксирана цена.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
                <Price
                  value={GOOGLE_PROFILE_PRICE}
                  className="text-3xl sm:text-4xl text-primary"
                />
                <Button
                  onClick={handleGoogleCheckout}
                  size="lg"
                  disabled={isAdding}
                  className="h-14 px-8 text-lg bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isAdding ? "Добавяне..." : "Добави бизнеса си в Google"}
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
                Защо губиш клиенти, ако те няма в Google Maps?
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Хората търсят услуги около тях всеки ден. Ако не те виждат, отиват при съседа.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {googlePainPoints.map((item) => (
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
                Какво е включено в пакета "Google Профил"?
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {googleSolutionItems.map((item) => (
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
                Как да стартираш? (Само 4 лесни стъпки)
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Улеснили сме процеса, за да не губиш излишно време в технически детайли.
              </p>
            </div>
            <div className="relative">
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-border to-transparent -translate-y-1/2" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {googleSteps.map((step, index) => (
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

        <div className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur px-4 py-3">
          <div className="mx-auto flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Пакет "Google Бизнес"</p>
              <Price value={GOOGLE_PROFILE_PRICE} className="font-semibold" />
            </div>
            <Button
              onClick={handleGoogleCheckout}
              disabled={isAdding}
              className="min-h-11 min-w-30 shrink-0 px-4 text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isAdding ? "Добавяне..." : "Започни сега"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (service.id === "social-media") {
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
              href="/#услуги"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              Към услугите
            </TransitionLink>

            <div className="max-w-4xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Smartphone className="h-4 w-4" />
                Пълно дигитално присъствие
              </span>
              <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-balance">
                Управление на Социални Мрежи и Реклама.{" "}
                <span className="gradient-text">Ние поемаме контрола, ти броиш продажбите.</span>
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
                  onClick={() => {
                    setIsAdding(true);
                    addToCart(service.id, service.options[0].id, []);
                    setTimeout(() => {
                      setIsAdding(false);
                      push("/кошница");
                    }, 250);
                  }}
                  size="lg"
                  disabled={isAdding}
                  className="h-14 px-8 text-lg bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isAdding ? "Добавяне..." : "Довери ни своите мрежи"}
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

        <div className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur px-4 py-3">
          <div className="mx-auto flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Пакет "Социални Мрежи"</p>
              <Price value={MARKETING_START_PRICE} className="font-semibold" />
              <p className="text-xs text-muted-foreground">/мес.</p>
            </div>
            <Button
              onClick={() => {
                setIsAdding(true);
                addToCart(service.id, service.options[0].id, []);
                setTimeout(() => {
                  setIsAdding(false);
                  push("/кошница");
                }, 250);
              }}
              disabled={isAdding}
              className="min-h-11 min-w-30 shrink-0 px-4 text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isAdding ? "Добавяне..." : "Стартирай сега"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <TransitionLink
          href="/#услуги"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Обратно към услугите
        </TransitionLink>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="flex items-start gap-4 mb-6">
              <div className="h-20 w-20 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {iconMap[service.icon]}
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">{service.name}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {service.timeline}
                  </span>
                  <span>
                    от <Price value={service.basePrice} className="text-primary font-semibold" />
                    {service.isMonthly && "/мес"}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {service.fullDescription}
            </p>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Какво включва</h2>
                <ul className="space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Други услуги</h2>
              <div className="flex flex-wrap gap-2">
                {services
                  .filter((s) => s.id !== service.id)
                  .map((s) => (
                    <TransitionLink key={s.id} href={`/услуги/${s.slug}`}>
                      <Button variant="outline" size="sm">
                        {s.name}
                      </Button>
                    </TransitionLink>
                  ))}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <PricingConfigurator service={service} />
          </div>
        </div>
      </div>
    </div>
  );
}
