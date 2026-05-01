"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import gsap from "gsap";
import { Check, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Price } from "@/components/ui/price";
import { cn } from "@/lib/utils";
import type { Service, CartItemUpsell } from "@/lib/types";
import { addToCart, CART_DUPLICATE_SERVICE_MESSAGE } from "@/lib/store/cart";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { toast } from "sonner";

interface PricingConfiguratorProps {
  service: Service;
}

export function PricingConfigurator({ service }: PricingConfiguratorProps) {
  const { push } = useTransitionRouter();
  const [selectedOptionId, setSelectedOptionId] = useState(service.options[0].id);
  const [upsells, setUpsells] = useState<Record<string, number>>({});
  const [isAdding, setIsAdding] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedOption = service.options.find((o) => o.id === selectedOptionId)!;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const blocks = root.querySelectorAll<HTMLElement>("[data-pricing-animate]");
      if (!blocks.length) return;
      gsap.set(blocks, { opacity: 0, y: 40 });
      gsap.to(blocks, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.12,
        ease: "back.out(1.4)",
        delay: 0.05,
      });
    }, root);

    return () => ctx.revert();
  }, [service.id]);

  const totalPrice = useMemo(() => {
    let total = selectedOption.price;
    for (const [upsellId, quantity] of Object.entries(upsells)) {
      if (quantity > 0) {
        const upsell = service.upsells.find((u) => u.id === upsellId);
        if (upsell) {
          total += (upsell.pricePerUnit ?? 0) * quantity;
        }
      }
    }
    return total;
  }, [selectedOption, upsells, service.upsells]);

  useEffect(() => {
    const el = rootRef.current?.querySelector<HTMLElement>("[data-total-pulse]");
    if (!el) return;
    gsap.fromTo(el, { scale: 1.05 }, { scale: 1, duration: 0.25, ease: "power2.out" });
  }, [totalPrice]);

  const updateUpsell = (upsellId: string, delta: number) => {
    const upsell = service.upsells.find((u) => u.id === upsellId);
    if (!upsell) return;

    setUpsells((prev) => {
      const current = prev[upsellId] || 0;
      const newValue = Math.max(0, Math.min(upsell.max || 99, current + delta));
      if (newValue === 0) {
        const { [upsellId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [upsellId]: newValue };
    });
    gsap.delayedCall(0, () => {
      const row = document.getElementById(`pricing-upsell-${upsellId}`);
      if (row) {
        gsap.fromTo(row, { scale: 1 }, { scale: 1.02, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" });
      }
    });
  };

  const handleAddToCart = () => {
    setIsAdding(true);

    const cartUpsells: CartItemUpsell[] = Object.entries(upsells)
      .filter(([_, quantity]) => quantity > 0)
      .map(([upsellId, quantity]) => ({ upsellId, quantity }));

    const result = addToCart(service.id, selectedOptionId, cartUpsells);
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
    }, 300);
  };

  return (
    <div ref={rootRef} className="space-y-6">
      {/* Package Selection */}
      <Card data-pricing-animate className="bg-card border-border opacity-0 translate-y-10">
        <CardHeader>
          <CardTitle className="text-lg">Изберете пакет</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {service.options.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedOptionId(option.id)}
              className={cn(
                "w-full text-left p-4 rounded-lg border-2 transition-all",
                selectedOptionId === option.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/50"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{option.name}</span>
                    {selectedOptionId === option.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <Price value={option.price} className="text-xl text-primary" />
                  {option.isMonthly && (
                    <span className="text-sm text-muted-foreground">/мес</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Upsells */}
      {service.upsells.length > 0 && (
        <Card data-pricing-animate className="bg-card border-border opacity-0 translate-y-10">
          <CardHeader>
            <CardTitle className="text-lg">Допълнителни услуги</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {service.upsells.map((upsell) => {
              const quantity = upsells[upsell.id] || 0;
              const upsellTotal = (upsell.pricePerUnit ?? 0) * quantity;

              return (
                <div
                  id={`pricing-upsell-${upsell.id}`}
                  key={upsell.id}
                  className={cn(
                    "p-4 rounded-lg border transition-colors will-change-transform",
                    quantity > 0
                      ? "border-primary/50 bg-primary/5"
                      : "border-border"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Label className="font-semibold block mb-1">
                        {upsell.name}
                      </Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        {upsell.description}
                      </p>
                      <p className="text-sm">
                        <Price value={upsell.pricePerUnit ?? 0} className="text-primary font-medium" />
                        <span className="text-muted-foreground">
                          {" "}/ {upsell.unit}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateUpsell(upsell.id, -1)}
                        disabled={quantity === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateUpsell(upsell.id, 1)}
                        disabled={quantity >= (upsell.max || 99)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {quantity > 0 && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {quantity} x <Price value={upsell.pricePerUnit ?? 0} />
                      </span>
                      <span className="font-medium text-primary">
                        +<Price value={upsellTotal} className="text-primary font-medium" />
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Total & Add to Cart */}
      <Card data-pricing-animate className="bg-primary/5 border-primary/20 opacity-0 translate-y-10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium">Обща цена</span>
            <div data-total-pulse className="text-right">
              <Price value={totalPrice} className="text-3xl gradient-text" />
              {selectedOption.isMonthly && (
                <span className="text-muted-foreground ml-1">/мес</span>
              )}
            </div>
          </div>
          <Button
            size="lg"
            className="w-full glow-primary"
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              "Добавяне..."
            ) : (
              <>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Добави в кошницата
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
