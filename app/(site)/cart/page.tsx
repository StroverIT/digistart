"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { ArrowLeft, ArrowRight, ChevronDown, Package, ShoppingCart, Trash2 } from "lucide-react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import type { Cart, CartItem, Service } from "@/lib/types";
import { serviceIdToPlanId } from "@/lib/data/plans";
import { getAdditionalServices } from "@/lib/cart/additional-services";
import { getCart, hasBundlePlanInCart, removeFromCart, updateCartItemUpsells } from "@/lib/store/cart";
import {
  applyAdminPricingToCart,
  isAdminCheckoutRole,
} from "@/lib/pricing/admin-checkout-pricing";
import { getServiceById } from "@/lib/data/services";
import {
  AdditionalServicesGrid,
  AdditionalServicesUpsellCard,
} from "@/components/services/additional-services-grid";
import { UpsellConfigurator } from "@/components/services/upsell-configurator";

function CartItemCard({
  item,
  priceItem,
  isAdminCheckout,
  serviceFromDb,
  onRemove,
  onUpsellsChange,
}: {
  item: CartItem;
  priceItem?: CartItem;
  isAdminCheckout?: boolean;
  serviceFromDb?: Service;
  onRemove: () => void;
  onUpsellsChange: (itemId: string, upsells: CartItem["upsells"]) => void;
}) {
  const prices = priceItem ?? item;
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
                  className="h-auto w-full justify-between px-0 py-1 text-sm font-medium hover:bg-transparent hover:text-primary cursor-pointer"
                  onClick={() => setShowUpsells((current) => !current)}
                  aria-expanded={showUpsells}
                >
                  <span>Допълнителни функционалности</span>
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
            {isAdminCheckout ? (
              <p className="text-sm font-medium text-primary">Включено</p>
            ) : (
              <Price value={prices.totalPrice} className="text-2xl text-primary" />
            )}
            {isAdminCheckout ? (
              <div className="text-xs font-medium text-muted-foreground mt-1">Админ поръчка</div>
            ) : prices.billingCycle === "annual-prepaid" ? (
              <div className="text-xs font-medium text-primary mt-1">
                Предплатено за 1 година
              </div>
            ) : null}
            <div className="text-xs text-muted-foreground mt-1">
              {prices.totalOneTime > 0 ? (
                <span>
                  {!isAdminCheckout && prices.billingCycle === "annual-prepaid"
                    ? "Дължимо сега"
                    : "Еднократно"}
                  : <Price value={prices.totalOneTime} />
                </span>
              ) : null}
              {!isAdminCheckout && prices.totalOneTime > 0 && prices.totalMonthly > 0 ? (
                <span> • </span>
              ) : null}
              {!isAdminCheckout && prices.totalMonthly > 0 ? (
                <span>
                  Месечно: <Price value={prices.totalMonthly} />/мес
                </span>
              ) : null}
            </div>
            {!isAdminCheckout &&
              prices.billingCycle === "annual-prepaid" &&
              prices.annualDiscountAmount ? (
              <div className="text-xs text-muted-foreground mt-1">
                Отстъпка: <Price value={prices.annualDiscountAmount} />
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CartPage() {
  const { data: session } = useSession();
  const isAdminCheckout = isAdminCheckoutRole(session?.user?.role);
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

  const displayCart = useMemo(
    () => (isAdminCheckout ? applyAdminPricingToCart(cart) : cart),
    [cart, isAdminCheckout],
  );

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
  const additionalServices = useMemo(
    () => getAdditionalServices(cart.items),
    [cart.items],
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
            <CardContent className="p-4 sm:p-6 py-12 sm:py-16">
              <div className="text-center mb-8">
                <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Кошницата е празна</h2>
                <p className="text-muted-foreground">
                  Изберете услуга и я добавете в кошницата.
                </p>
              </div>
              <AdditionalServicesGrid
                services={additionalServices}
                title="Нашите услуги"
                description="Изберете услуга според нуждите на бизнеса ви."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                const priceItem = displayCart.items.find((displayItem) => displayItem.id === item.id);
                return (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    priceItem={priceItem}
                    isAdminCheckout={isAdminCheckout}
                    serviceFromDb={servicesById[item.serviceId]}
                    onRemove={() => handleRemove(item.id)}
                    onUpsellsChange={handleUpsellsChange}
                  />
                );
              })}

              {additionalServices.length > 0 ? (
                <div className="hidden lg:block">
                  <AdditionalServicesUpsellCard
                    services={additionalServices}
                    dataMarker="cart"
                    className="opacity-0 translate-y-10"
                  />
                </div>
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
                  {displayCart.totalOneTime > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {isAdminCheckout
                          ? "Еднократно (админ)"
                          : displayCart.items.some((item) => item.billingCycle === "annual-prepaid")
                            ? "Еднократни плащания и предплащания"
                            : "Еднократни услуги"}
                      </span>
                      <Price value={displayCart.totalOneTime} className="font-semibold" />
                    </div>
                  )}
                  {!isAdminCheckout && displayCart.totalMonthly > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Месечни абонаменти
                      </span>
                      <span className="font-semibold">
                        <Price value={displayCart.totalMonthly} />/мес
                      </span>
                    </div>
                  )}

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">Обща сума</span>
                      <Price
                        value={displayCart.totalOneTime + displayCart.totalMonthly}
                        className="text-2xl gradient-text"
                      />
                    </div>
                    {!isAdminCheckout &&
                      displayCart.totalMonthly > 0 &&
                      displayCart.totalOneTime > 0 ? (
                      <p className="text-sm text-muted-foreground text-right">
                        + <Price value={displayCart.totalMonthly} />/мес след това
                      </p>
                    ) : null}
                  </div>

                  <TrackedCtaLink href="/checkout" ctaId="cart_to_checkout" className="block">
                    <Button size="lg" className="w-full glow-primary">
                      Продължи към поръчка
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </TrackedCtaLink>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
