"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TransitionLink from "@/components/transitions/TransitionLink";
import { CheckCircle2, ArrowRight, Mail, Phone, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { siteContact } from "@/lib/site-contact";
import type { Order } from "@/lib/types";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<Order | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (orderId) {
      fetch(`/api/checkout/orders/${orderId}`)
        .then((response) => (response.ok ? response.json() : null))
        .then((data: { order?: Order } | null) => {
          setOrder(data?.order ?? null);
        })
        .catch(() => setOrder(null));
    }
  }, [orderId]);

  if (!mounted) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Success Icon */}
      <div className="relative mb-8">
        <div className="h-24 w-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <div className="absolute inset-0 h-24 w-24 mx-auto rounded-full bg-green-500/10 animate-ping" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold mb-4">
        Поръчката е успешна!
      </h1>

      <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
        Благодарим ви за доверието! Ще се свържем с вас в рамките на 24 часа за да обсъдим детайлите.
      </p>

      {order && (
        <p className="text-sm mb-6 text-muted-foreground">
          Статус на плащането:{" "}
          <span className="font-semibold text-foreground">
            {order.status === "paid" ? "Потвърдено" : "Обработва се"}
          </span>
        </p>
      )}

      {order && (
        <Card className="bg-card border-border mb-8 text-left">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Номер на поръчка
              </span>
              <span className="font-mono font-bold text-primary">
                {order.id}
              </span>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              {order.cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {item.serviceName} - {item.selectedOptionName}
                  </span>
                  <span className="font-medium">
                    <Price value={item.totalPrice} />
                    {item.isMonthly && "/мес"}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 mt-4 flex items-center justify-between">
              <span className="font-semibold">Обща сума</span>
              <Price
                value={order.cart.totalOneTime + order.cart.totalMonthly}
                className="text-xl gradient-text"
              />
            </div>

            {order.consultation ? (
              <div className="border-t border-border pt-4 mt-4">
                <p className="text-sm text-muted-foreground mb-1">
                  Запазена консултация
                </p>
                <p className="font-medium">
                  {order.consultation.date} в {order.consultation.time}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="bg-primary/5 border-primary/20 mb-8">
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">Какво следва?</h2>
          <ol className="text-left space-y-3">
            <li className="flex items-start gap-3">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <span className="text-muted-foreground">
                Ще получите имейл с потвърждение на поръчката
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <span className="text-muted-foreground">
                {order?.consultation
                  ? `Консултацията ви е потвърдена за ${order.consultation.date} в ${order.consultation.time}`
                  : "Наш консултант ще се свърже с вас за безплатна консултация"}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <span className="text-muted-foreground">
                Стартираме работа по вашия проект
              </span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8 text-sm text-muted-foreground">
        <a
          href={`mailto:${siteContact.email}`}
          className="flex items-center gap-2 hover:text-primary transition-colors"
        >
          <Mail className="h-4 w-4" />
          {siteContact.email}
        </a>
        <a
          href={siteContact.phoneHref}
          className="flex items-center gap-2 hover:text-primary transition-colors"
        >
          <Phone className="h-4 w-4" />
          {siteContact.phoneLabel}
        </a>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <TransitionLink href="/">
          <Button variant="outline" size="lg">
            <Home className="mr-2 h-5 w-5" />
            Към началото
          </Button>
        </TransitionLink>
        <TransitionLink href="/#services">
          <Button size="lg" className="glow-primary">
            Разгледайте още услуги
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </TransitionLink>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <Suspense
          fallback={
            <div className="h-96 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
