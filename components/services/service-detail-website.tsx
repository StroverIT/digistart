"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  FileText,
  Lock,
  Rocket,
  ShoppingCart,
  Zap,
} from "lucide-react";
import TransitionLink from "@/components/transitions/TransitionLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { addToCart } from "@/lib/store/cart";
import { getServiceById } from "@/lib/data/services";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";

const service = getServiceById("websites");

const steps = [
  {
    title: "Стъпка 1: Поръчваш онлайн",
    text: "Избираш пакета и плащаш сигурно през нашия сайт. Без чакане за оферти.",
    icon: ShoppingCart,
  },
  {
    title: "Стъпка 2: Попълваш въпросник",
    text: "Веднага след плащането получаваш линк, където да прикачиш своето лого, текстове и снимки.",
    icon: FileText,
  },
  {
    title: "Стъпка 3: Сайтът ти е готов",
    text: "Ние сглобяваме всичко и до броени дни твоят нов уебсайт е официално онлайн и готов да печели клиенти.",
    icon: Rocket,
  },
] as const;

export function ServiceDetailWebsite() {
  const { push } = useTransitionRouter();
  const [selectedUpsells, setSelectedUpsells] = useState<Record<string, number>>({});
  const [isAdding, setIsAdding] = useState(false);

  if (!service) return null;

  const selectedOption = service.options[0];

  const totalPrice = useMemo(() => {
    return service.upsells.reduce((total, upsell) => {
      const qty = selectedUpsells[upsell.id] ?? 0;
      return total + qty * upsell.pricePerUnit;
    }, selectedOption.price);
  }, [selectedOption.price, selectedUpsells]);

  const toggleUpsell = (upsellId: string) => {
    setSelectedUpsells((prev) => ({
      ...prev,
      [upsellId]: prev[upsellId] === 1 ? 0 : 1,
    }));
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    const upsells = Object.entries(selectedUpsells)
      .filter(([_, quantity]) => quantity > 0)
      .map(([upsellId, quantity]) => ({ upsellId, quantity }));

    addToCart(service.id, selectedOption.id, upsells);

    setTimeout(() => {
      setIsAdding(false);
      push("/кошница");
    }, 300);
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <TransitionLink
          href="/#услуги"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          Към услугите
        </TransitionLink>

        <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 md:p-12">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-sm font-medium">
              <Zap className="h-4 w-4" />
              Бърза изработка
            </span>
            <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-bold text-balance">
              Професионален Фирмен Уебсайт
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Представи бизнеса си онлайн с модерен сайт, без да чакаш с месеци и без излишни
              срещи. Плащаш предварително ясна цена, а ние вършим останалото.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-4">
              <p className="text-2xl font-bold">
                {totalPrice} лв.
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (базова цена: 299 лв.)
                </span>
              </p>
              <Button onClick={handleAddToCart} size="lg" disabled={isAdding}>
                {isAdding ? "Добавяне..." : "Добави в количката и стартирай"}
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Какво получаваш в пакета?</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {service.features.map((feature) => (
              <Card key={feature} className="border-border">
                <CardContent className="p-5 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-muted-foreground">{feature}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Как работи? (Само 3 стъпки)</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <Card key={step.title} className="border-border">
                <CardContent className="p-6">
                  <step.icon className="h-6 w-6 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Увеличи резултатите си (Добавки)
          </h2>
          <div className="space-y-3">
            {service.upsells.map((upsell) => {
              const selected = (selectedUpsells[upsell.id] ?? 0) > 0;

              return (
                <button
                  key={upsell.id}
                  type="button"
                  onClick={() => toggleUpsell(upsell.id)}
                  className={`w-full rounded-xl border p-5 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{upsell.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{upsell.description}</p>
                    </div>
                    <p className="font-semibold text-primary">+{upsell.pricePerUnit} лв.</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-12 rounded-xl border border-border bg-card p-5 sm:p-6">
          <p className="text-sm sm:text-base flex items-start gap-2 text-muted-foreground">
            <Lock className="h-4 w-4 mt-0.5 shrink-0" />
            100% Прозрачност: Без скрити месечни такси за поддръжка от наша страна. Сайтът е
            изцяло твоя собственост!
          </p>
        </section>
      </div>
    </div>
  );
}
