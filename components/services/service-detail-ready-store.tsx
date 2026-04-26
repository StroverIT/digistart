"use client";

import { useMemo, useState } from "react";
import TransitionLink from "@/components/transitions/TransitionLink";
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  LayoutDashboard,
  Rocket,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { addToCart, calculateItemTotal } from "@/lib/store/cart";
import type { CartItemUpsell } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";

const SERVICE_ID = "ready-store";
const OPTION_ID = "standard";

const FEATURES = [
  "Индивидуален дизайн с твоето лого",
  "Качване на първите 20 продукта",
  "Интеграция на методи за плащане (Stripe/Наложен платеж)",
  "Мобилна версия (Responsive design)",
  "Основни SEO настройки",
  "Безплатен хостинг за първия месец",
] as const;

const STEPS = [
  {
    title: "1. Поръчваш",
    body: "Избираш пакета и плащаш сигурно онлайн.",
    icon: ShoppingCart,
  },
  {
    title: "2. Попълваш",
    body: "Получаваш кратък въпросник, където качваш лого и информация.",
    icon: FileText,
  },
  {
    title: "3. Продаваш",
    body: "До 48 часа магазинът ти е готов за първите клиенти.",
    icon: Rocket,
  },
] as const;

const ADDONS = [
  {
    id: "gmb-profile" as const,
    title: "Google My Business Профил",
    price: 99,
  },
  {
    id: "facebook-pixel" as const,
    title: "Facebook Pixel Интеграция",
    price: 49,
  },
] as const;

type AddonId = (typeof ADDONS)[number]["id"];

interface ServiceDetailReadyStoreProps {
  headingFontClass: string;
}

function StorefrontPreview() {
  return (
    <div
      className="relative mx-auto w-full max-w-lg select-none rounded-2xl border border-gray-200/80 bg-white p-3 shadow-2xl shadow-blue-600/10 ring-1 ring-black/5 sm:p-4"
      aria-hidden
    >
      <div className="mb-3 flex items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-2.5 text-white sm:px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-blue-100">
              DigiStart Store
            </p>
            <p className="text-sm font-bold leading-tight">Табло · Поръчки</p>
          </div>
        </div>
        <TrendingUp className="h-5 w-5 shrink-0 text-blue-100" />
      </div>
      <div className="grid grid-cols-12 gap-2 sm:gap-3">
        <div className="col-span-4 space-y-2 rounded-xl bg-gray-50 p-2 sm:p-3">
          <div className="h-2 w-8 rounded-full bg-blue-600/80" />
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full",
                i === 1 ? "bg-blue-600" : "bg-gray-200"
              )}
            />
          ))}
        </div>
        <div className="col-span-8 space-y-2 sm:space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm">
              <p className="text-[10px] text-gray-500">Приход днес</p>
              <p className="text-lg font-black text-gray-900">1 240 лв</p>
              <div className="mt-2 h-8 rounded-md bg-gradient-to-t from-blue-600/20 to-transparent" />
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm">
              <p className="text-[10px] text-gray-500">Поръчки</p>
              <p className="text-lg font-black text-gray-900">18</p>
              <div className="mt-2 flex items-end gap-0.5">
                {[40, 65, 35, 80, 55, 90].map((h, j) => (
                  <div
                    key={j}
                    className="flex-1 rounded-sm bg-orange-500/85"
                    style={{ height: `${h}%`, minHeight: "18px" }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-2.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-blue-900">
                Последни продажби
              </span>
              <span className="rounded-md bg-white px-1.5 py-0.5 text-[9px] font-medium text-blue-600 ring-1 ring-blue-100">
                На живо
              </span>
            </div>
            <div className="space-y-1.5">
              {[1, 2, 3].map((row) => (
                <div
                  key={row}
                  className="flex items-center gap-2 rounded-lg bg-white/90 px-2 py-1.5 shadow-sm ring-1 ring-gray-100"
                >
                  <div className="h-8 w-8 rounded-md bg-gray-100" />
                  <div className="min-w-0 flex-1">
                    <div className="h-2 w-2/3 max-w-[120px] rounded-full bg-gray-200" />
                    <div className="mt-1 h-1.5 w-1/3 rounded-full bg-gray-100" />
                  </div>
                  <div className="shrink-0 text-[10px] font-bold text-emerald-600">
                    +{row * 37} лв
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServiceDetailReadyStore({
  headingFontClass,
}: ServiceDetailReadyStoreProps) {
  const { push } = useTransitionRouter();
  const [addons, setAddons] = useState<Record<AddonId, boolean>>({
    "gmb-profile": false,
    "facebook-pixel": false,
  });
  const [isAdding, setIsAdding] = useState(false);

  const cartUpsells: CartItemUpsell[] = useMemo(() => {
    const list: CartItemUpsell[] = [];
    if (addons["gmb-profile"]) {
      list.push({ upsellId: "gmb-profile", quantity: 1 });
    }
    if (addons["facebook-pixel"]) {
      list.push({ upsellId: "facebook-pixel", quantity: 1 });
    }
    return list;
  }, [addons]);

  const { total } = calculateItemTotal(SERVICE_ID, OPTION_ID, cartUpsells);

  const toggleAddon = (id: AddonId) => {
    setAddons((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCheckout = () => {
    setIsAdding(true);
    addToCart(SERVICE_ID, OPTION_ID, cartUpsells);
    setTimeout(() => {
      setIsAdding(false);
      push("/кошница");
    }, 250);
  };

  return (
    <div className="relative min-h-screen bg-gray-50 text-gray-900">
      <div className="border-b border-gray-200/80 bg-white">
        <div className="container mx-auto max-w-6xl px-4 pb-10 pt-24 sm:pb-14 sm:pt-28 md:pt-32">
          <TransitionLink
            href="/#услуги"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Обратно към услугите
          </TransitionLink>

          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="order-2 lg:order-1">
              <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                Бърза изработка
              </span>
              <h1
                className={cn(
                  headingFontClass,
                  "mt-4 text-4xl font-black leading-[1.05] tracking-tight text-gray-900 sm:text-5xl sm:leading-[1.02] lg:text-6xl"
                )}
              >
                Готов Онлайн Магазин
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
                Продавай веднага с професионален магазин, настроен специално за
                твоя бизнес. Без скрити такси.
              </p>
              <p
                className={cn(
                  headingFontClass,
                  "mt-8 text-3xl font-black text-blue-600 sm:text-4xl"
                )}
              >
                Цена: {total} лв.
              </p>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isAdding}
                className="mt-6 flex h-14 w-full items-center justify-center rounded-xl bg-orange-500 px-6 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 active:scale-[0.99] disabled:opacity-70 sm:min-w-[280px] sm:w-auto"
              >
                {isAdding ? "Добавяне..." : "Добави в количката и стартирай"}
              </button>
            </div>

            <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
              <div className="relative w-full max-w-lg">
                <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-blue-600/15 blur-2xl sm:h-40 sm:w-40" />
                <div className="pointer-events-none absolute -bottom-8 -left-4 h-28 w-28 rounded-full bg-orange-400/20 blur-2xl" />
                <StorefrontPreview />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="border-b border-gray-200/80 bg-white py-12 sm:py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <h2
            className={cn(
              headingFontClass,
              "text-2xl font-black tracking-tight text-gray-900 sm:text-3xl"
            )}
          >
            Какво получаваш в пакета?
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5">
            {FEATURES.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3.5 sm:px-5 sm:py-4"
              >
                <CheckCircle
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500"
                  strokeWidth={2.25}
                />
                <span className="text-[15px] leading-snug text-gray-700 sm:text-base">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-gray-200/80 bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <h2
            className={cn(
              headingFontClass,
              "text-2xl font-black tracking-tight text-gray-900 sm:text-3xl"
            )}
          >
            Как работи? (Само 3 стъпки)
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
            {STEPS.map(({ title, body, icon: Icon }) => (
              <div
                key={title}
                className="flex flex-col rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/25">
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3
                  className={cn(
                    headingFontClass,
                    "mt-4 text-lg font-black text-gray-900 sm:text-xl"
                  )}
                >
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-[15px]">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white pb-28 pt-12 sm:pb-16 sm:pt-16 md:pb-16">
        <div className="container mx-auto max-w-6xl px-4">
          <h2
            className={cn(
              headingFontClass,
              "text-2xl font-black tracking-tight text-gray-900 sm:text-3xl"
            )}
          >
            Увеличи продажбите си (Добавки)
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
            {ADDONS.map((addon) => {
              const selected = addons[addon.id];
              return (
                <div
                  key={addon.id}
                  className={cn(
                    "flex flex-col rounded-2xl border-2 bg-gray-50/50 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between sm:p-5",
                    selected
                      ? "border-blue-600 bg-blue-50/40"
                      : "border-gray-100"
                  )}
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {addon.title}
                    </p>
                    <p className="mt-1 text-lg font-black text-blue-600">
                      {addon.price} лв.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={cn(
                      "mt-4 inline-flex h-11 shrink-0 items-center justify-center rounded-lg px-4 text-sm font-semibold transition sm:mt-0",
                      selected
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                    )}
                  >
                    {selected ? "Добавено ✓" : "+ Добави"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <p
            className={cn(
              headingFontClass,
              "text-xl font-black tabular-nums text-gray-900"
            )}
          >
            {total} лв.
          </p>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isAdding}
            className="min-h-11 shrink-0 rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white shadow-md shadow-orange-500/25 hover:bg-orange-600 disabled:opacity-70"
          >
            {isAdding ? "..." : "Купи Сега"}
          </button>
        </div>
      </div>
    </div>
  );
}
