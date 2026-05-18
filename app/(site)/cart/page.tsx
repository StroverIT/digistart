"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { ArrowLeft, ArrowRight, ChevronDown, Package, ShoppingCart, Trash2 } from "lucide-react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import type { Cart, CartItem, Service } from "@/lib/types";
import { getPlanComponentsForRecalc, serviceIdToPlanId } from "@/lib/data/plans";
import type { PlanId } from "@/lib/data/plans";
import { getCart, hasBundlePlanInCart, removeFromCart, updateCartItemUpsells } from "@/lib/store/cart";
import { getServiceById, services } from "@/lib/data/services";
import { UpsellConfigurator } from "@/components/services/upsell-configurator";

const additionalServicePrompts: Record<string, string> = {
  "ready-store": "Искаш ли онлайн магазин за 20 евро на месец?",
  "social-media": "Искаш ли да достигнеш до още повече клиенти?",
  "google-business": "Искаш ли локално да достигнеш до повече клиенти?",
};

const serviceStickerMap: Record<string, string> = {
  "ready-store": "/stickers/online-shop.png",
  "google-business": "/stickers/my-business.png",
  "social-media": "/stickers/social-media.png",
};

function AdditionalServiceSticker({ service }: { service: Service }) {
  const src = serviceStickerMap[service.id];
  if (!src) return null;

  return (
    <div className="relative h-56 w-56 shrink-0 -my-10">
      <Image src={src} alt={`${service.name} sticker`} fill className="object-contain" sizes="5rem" />
    </div>
  );
}

function CartItemCard({
  item,
  serviceFromDb,
  onRemove,
  onUpsellsChange,
}: {
  item: CartItem;
  serviceFromDb?: Service;
  onRemove: () => void;
  onUpsellsChange: (itemId: string, upsells: CartItem["upsells"]) => void;
}) {
  const service = useMemo((): Service | undefined => {
    const fromApi = serviceFromDb;
    const fromStatic = getServiceById(item.serviceId);
    if (!fromApi) return fromStatic;
    if (fromApi.upsells.length > 0) return fromApi;
    if (fromStatic && fromStatic.upsells.length > 0) {
      return { ...fromApi, upsells: fromStatic.upsells };
    }
    return fromApi;
  }, [serviceFromDb, item.serviceId]);
  const [showUpsells, setShowUpsells] = useState(false);
  const isPlanItem = Boolean(item.planId || serviceIdToPlanId(item.serviceId));
  const hasUpsells = Boolean(service?.upsells.length) && !isPlanItem;
  const upsellsWrapperRef = useRef<HTMLDivElement | null>(null);
  const upsellsContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrapper = upsellsWrapperRef.current;
    if (!wrapper || !hasUpsells) return;

    gsap.set(wrapper, { height: 0, autoAlpha: 0, display: "none" });
  }, [hasUpsells]);

  useEffect(() => {
    const wrapper = upsellsWrapperRef.current;
    const content = upsellsContentRef.current;
    if (!wrapper || !content || !hasUpsells) return;

    gsap.killTweensOf(wrapper);

    if (showUpsells) {
      gsap.set(wrapper, { display: "block" });
      gsap.fromTo(
        wrapper,
        { height: 0, autoAlpha: 0 },
        {
          height: content.scrollHeight,
          autoAlpha: 1,
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => gsap.set(wrapper, { height: "auto" }),
        }
      );
      return;
    }

    gsap.fromTo(
      wrapper,
      { height: wrapper.offsetHeight, autoAlpha: 1 },
      {
        height: 0,
        autoAlpha: 0,
        duration: 0.24,
        ease: "power2.in",
        onComplete: () => gsap.set(wrapper, { display: "none" }),
      }
    );
  }, [hasUpsells, showUpsells]);

  return (
    <Card data-cart-item className="bg-card border-border opacity-0 translate-y-10">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Item info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-lg">{item.serviceName}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.selectedOptionName}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive shrink-0"
                onClick={onRemove}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Премахни</span>
              </Button>
            </div>

            {/* Upsells */}
            {service && hasUpsells ? (
              <div className="mt-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto w-full justify-between px-0 py-1 text-sm font-medium hover:bg-transparent"
                  onClick={() => setShowUpsells((current) => !current)}
                  aria-expanded={showUpsells}
                >
                  <span>Допълнителни услуги</span>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    {showUpsells ? "Скрий" : "Покажи"}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${showUpsells ? "rotate-180" : ""}`}
                    />
                  </span>
                </Button>
                <div ref={upsellsWrapperRef} className="mt-2 overflow-hidden">
                  <div ref={upsellsContentRef}>
                    <UpsellConfigurator
                      service={service}
                      value={item.upsells}
                      onChange={(upsells) => onUpsellsChange(item.id, upsells)}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Price */}
          <div className="text-right shrink-0">
            <Price value={item.totalPrice} className="text-2xl text-primary" />
            <div className="text-xs text-muted-foreground mt-1">
              {item.totalOneTime > 0 ? (
                <span>
                  Еднократно: <Price value={item.totalOneTime} />
                </span>
              ) : null}
              {item.totalOneTime > 0 && item.totalMonthly > 0 ? <span> • </span> : null}
              {item.totalMonthly > 0 ? (
                <span>
                  Месечно: <Price value={item.totalMonthly} />/мес
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart>({ items: [], totalOneTime: 0, totalMonthly: 0 });
  const [servicesById, setServicesById] = useState<Record<string, Service>>({});
  const [mounted, setMounted] = useState(false);
  const cartRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setCart(getCart());
    fetch("/api/services")
      .then((response) => response.json())
      .then((data: { services?: Service[] }) => {
        const map: Record<string, Service> = {};
        for (const service of data.services ?? []) map[service.id] = service;
        setServicesById(map);
      })
      .catch(() => undefined);

    const handleCartUpdate = () => {
      setCart(getCart());
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  const handleRemove = (itemId: string) => {
    const updatedCart = removeFromCart(itemId);
    setCart(updatedCart);
  };

  const handleUpsellsChange = (itemId: string, upsells: CartItem["upsells"]) => {
    const updatedCart = updateCartItemUpsells(itemId, upsells);
    setCart(updatedCart);
  };

  const isEmpty = cart.items.length === 0;
  const bundleInCart = hasBundlePlanInCart();
  const overlappingWithBundle = bundleInCart
    ? cart.items.filter(
      (item) =>
        !item.planId &&
        !serviceIdToPlanId(item.serviceId) &&
        ["ready-store", "social-media", "google-business"].includes(item.serviceId),
    )
    : [];
  const includedServiceIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of cart.items) {
      const planId = (item.planId as PlanId | undefined) ?? serviceIdToPlanId(item.serviceId);
      if (planId) {
        for (const component of getPlanComponentsForRecalc(planId)) {
          ids.add(component.serviceId);
        }
        continue;
      }
      ids.add(item.serviceId);
    }
    return ids;
  }, [cart.items]);
  const additionalServices = useMemo(
    () =>
      services.filter(
        (service) => additionalServicePrompts[service.id] && !includedServiceIds.has(service.id),
      ),
    [includedServiceIds],
  );

  useEffect(() => {
    if (!mounted) return;
    const root = cartRootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      if (isEmpty) {
        const emptyCard = root.querySelector<HTMLElement>("[data-cart-empty]");
        if (emptyCard) {
          gsap.set(emptyCard, { opacity: 0, y: 40 });
          gsap.to(emptyCard, { opacity: 1, y: 0, duration: 0.55, ease: "back.out(1.4)" });
        }
        return;
      }

      const header = root.querySelector<HTMLElement>("[data-cart-header]");
      const items = root.querySelectorAll<HTMLElement>("[data-cart-item]");
      const additional = root.querySelector<HTMLElement>("[data-cart-additional-services]");
      const summary = root.querySelector<HTMLElement>("[data-cart-summary]");
      const targets = [header, ...Array.from(items), additional, summary].filter(
        Boolean,
      ) as HTMLElement[];
      if (!targets.length) return;

      gsap.set(targets, { opacity: 0, y: 36 });
      const tl = gsap.timeline({ defaults: { ease: "back.out(1.3)" } });
      if (header) tl.to(header, { opacity: 1, y: 0, duration: 0.45 }, 0);
      if (items.length) {
        tl.to(
          items,
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.12 },
          header ? "-=0.2" : 0,
        );
      }
      if (additional) tl.to(additional, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25");
      if (summary) tl.to(summary, { opacity: 1, y: 0, duration: 0.5 }, "-=0.35");
    }, root);

    return () => ctx.revert();
  }, [mounted, isEmpty, cart.items.length]);

  if (!mounted) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={cartRootRef} className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div data-cart-header className="flex items-center gap-4 mb-8 opacity-0 translate-y-10">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Кошница</h1>
            <p className="text-muted-foreground">
              {isEmpty
                ? "Вашата кошница е празна"
                : `${cart.items.length} ${cart.items.length === 1 ? "услуга" : "услуги"}`}
            </p>
          </div>
        </div>

        {overlappingWithBundle.length > 0 && (
          <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
            Имате абонаментен пакет и отделни услуги, които може да се припокриват (
            {overlappingWithBundle.map((i) => i.serviceName).join(", ")}). Препоръчваме само пакета
            или само отделните услуги.
          </div>
        )}

        {isEmpty ? (
          <Card data-cart-empty className="bg-card border-border opacity-0 translate-y-10">
            <CardContent className="py-16 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Кошницата е празна</h2>
              <p className="text-muted-foreground mb-6">
                Разгледайте нашите услуги и добавете нещо в кошницата.
              </p>
              <TrackedCtaLink href="/#services" ctaId="cart_empty_to_services">
                <Button className="glow-primary">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Към услугите
                </Button>
              </TrackedCtaLink>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  serviceFromDb={servicesById[item.serviceId]}
                  onRemove={() => handleRemove(item.id)}
                  onUpsellsChange={handleUpsellsChange}
                />
              ))}

              {additionalServices.length > 0 ? (
                <Card
                  data-cart-additional-services
                  className="bg-card border-border opacity-0 translate-y-10"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold">Може да ти бъде полезно още</h2>
                      <p className="text-sm text-muted-foreground">
                        Добави липсващите услуги, за да покриеш повече канали за продажби.
                      </p>
                    </div>
                    <div className="grid gap-3 xl:grid-cols-2">
                      {additionalServices.map((service) => (
                        <div key={service.id} className="[&>span]:flex [&>span]:w-full">
                          <TrackedCtaLink
                            href={`/services/${service.slug}`}
                            ctaId={`cart_upsell_${service.slug}`}
                            className="flex flex-col xl:flex-row w-full items-center rounded-xl border border-border bg-background/60 p-5 text-left transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <AdditionalServiceSticker service={service} />
                            <span className="text-sm font-semibold leading-snug text-center xl:text-left">
                              {additionalServicePrompts[service.id]}
                            </span>
                          </TrackedCtaLink>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <TrackedCtaLink
                href="/#services"
                ctaId="cart_continue_shopping"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mt-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Продължете с пазаруването
              </TrackedCtaLink>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card
                data-cart-summary
                className="bg-card border-border sticky top-24 opacity-0 translate-y-10"
              >
                <CardHeader>
                  <CardTitle>Обобщение</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.totalOneTime > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Еднократни услуги
                      </span>
                      <Price value={cart.totalOneTime} className="font-semibold" />
                    </div>
                  )}
                  {cart.totalMonthly > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Месечни абонаменти
                      </span>
                      <span className="font-semibold">
                        <Price value={cart.totalMonthly} />/мес
                      </span>
                    </div>
                  )}

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">Обща сума</span>
                      <Price
                        value={cart.totalOneTime + cart.totalMonthly}
                        className="text-2xl gradient-text"
                      />
                    </div>
                    {cart.totalMonthly > 0 && cart.totalOneTime > 0 && (
                      <p className="text-sm text-muted-foreground text-right">
                        + <Price value={cart.totalMonthly} />/мес след това
                      </p>
                    )}
                  </div>

                  <TrackedCtaLink href="/checkout" ctaId="cart_to_checkout" className="block">
                    <Button size="lg" className="w-full glow-primary">
                      Продължи към поръчка
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </TrackedCtaLink>

                  <p className="text-xs text-muted-foreground text-center">
                    Плащането ще бъде извършено през Stripe
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
