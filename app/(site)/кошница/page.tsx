"use client";

import { useState, useEffect } from "react";
import TransitionLink from "@/components/transitions/TransitionLink";
import { ArrowLeft, ArrowRight, ShoppingCart, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Cart, CartItem } from "@/lib/types";
import { getCart, removeFromCart } from "@/lib/store/cart";
import { getServiceById } from "@/lib/data/services";

function CartItemCard({
  item,
  onRemove,
}: {
  item: CartItem;
  onRemove: () => void;
}) {
  const service = getServiceById(item.serviceId);

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
            {item.upsells.length > 0 && service && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm font-medium mb-2">Допълнителни услуги:</p>
                <ul className="space-y-1">
                  {item.upsells.map((upsell) => {
                    const serviceUpsell = service.upsells.find(
                      (u) => u.id === upsell.upsellId
                    );
                    if (!serviceUpsell) return null;
                    return (
                      <li
                        key={upsell.upsellId}
                        className="text-sm text-muted-foreground flex items-center justify-between"
                      >
                        <span>
                          {serviceUpsell.name} x{upsell.quantity}
                        </span>
                        <span>
                          +{serviceUpsell.pricePerUnit * upsell.quantity} лв
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="text-right shrink-0">
            <span className="text-2xl font-bold text-primary">
              {item.totalPrice} лв
            </span>
            {item.isMonthly && (
              <span className="text-sm text-muted-foreground">/мес</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart>({ items: [], totalOneTime: 0, totalMonthly: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCart(getCart());

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
              <TransitionLink href="/#услуги">
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
                  onRemove={() => handleRemove(item.id)}
                />
              ))}

              <TransitionLink
                href="/#услуги"
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
                      <span className="font-semibold">
                        {cart.totalOneTime} лв
                      </span>
                    </div>
                  )}
                  {cart.totalMonthly > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Месечни абонаменти
                      </span>
                      <span className="font-semibold">
                        {cart.totalMonthly} лв/мес
                      </span>
                    </div>
                  )}

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">Обща сума</span>
                      <span className="text-2xl font-bold gradient-text">
                        {cart.totalOneTime + cart.totalMonthly} лв
                      </span>
                    </div>
                    {cart.totalMonthly > 0 && cart.totalOneTime > 0 && (
                      <p className="text-sm text-muted-foreground text-right">
                        + {cart.totalMonthly} лв/мес след това
                      </p>
                    )}
                  </div>

                  <TransitionLink href="/поръчка" className="block">
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
