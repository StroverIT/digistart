"use client";

import { useEffect, useRef, useState } from "react";
import TransitionLink from "@/components/transitions/TransitionLink";
import { ArrowLeft, ArrowRight, ChevronDown, Package, ShoppingCart, Trash2 } from "lucide-react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import type { Cart, CartItem, Service } from "@/lib/types";
import { getCart, removeFromCart, updateCartItemUpsells } from "@/lib/store/cart";
import { getServiceById } from "@/lib/data/services";
import { UpsellConfigurator } from "@/components/services/upsell-configurator";

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
  const service = serviceFromDb ?? getServiceById(item.serviceId);
  const [showUpsells, setShowUpsells] = useState(false);
  const hasUpsells = Boolean(service?.upsells.length);
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
    <Card className="bg-card border-border">
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

  const isEmpty = cart.items.length === 0;

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
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

        {isEmpty ? (
          <Card className="bg-card border-border">
            <CardContent className="py-16 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Кошницата е празна</h2>
              <p className="text-muted-foreground mb-6">
                Разгледайте нашите услуги и добавете нещо в кошницата.
              </p>
              <TransitionLink href="/#services">
                <Button className="glow-primary">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Към услугите
                </Button>
              </TransitionLink>
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

              <TransitionLink
                href="/#services"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mt-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Продължете с пазаруването
              </TransitionLink>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-card border-border sticky top-24">
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

                  <TransitionLink href="/checkout" className="block">
                    <Button size="lg" className="w-full glow-primary">
                      Продължи към поръчка
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </TransitionLink>

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
