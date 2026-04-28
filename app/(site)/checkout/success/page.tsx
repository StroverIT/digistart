"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import TransitionLink from "@/components/transitions/TransitionLink";
import { CheckCircle2, ArrowRight, Mail, Phone, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { siteContact } from "@/lib/site-contact";
import type { Order } from "@/lib/types";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const orderId = searchParams.get("id");
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [mounted, setMounted] = useState(false);
  const autoSignInDone = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !orderId) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 15;

    const poll = async () => {
      if (cancelled) return;
      const q = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : "";
      const res = await fetch(`/api/checkout/orders/${orderId}${q}`);
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as { order?: Order };
      const o = data.order ?? null;
      setOrder(o);

      if (
        o?.status === "paid" &&
        o.userId &&
        o.postCheckoutToken &&
        sessionId &&
        status === "unauthenticated" &&
        !autoSignInDone.current
      ) {
        const result = await signIn("post-checkout", {
          orderId,
          token: o.postCheckoutToken,
          redirect: false,
        });
        if (!result?.error) {
          autoSignInDone.current = true;
          router.replace("/user");
          router.refresh();
          return;
        }
      }

      attempts += 1;
      if (attempts < maxAttempts) {
        setTimeout(poll, 1000);
      }
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [mounted, orderId, sessionId, status, router]);

  if (!mounted) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="relative mb-8">
        <div className="h-24 w-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <div className="absolute inset-0 h-24 w-24 mx-auto rounded-full bg-green-500/10 animate-ping" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold mb-4">Поръчката е успешна!</h1>

      <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
        Благодарим ви за доверието! Ще се свържем с вас в рамките на 24 часа за следващите стъпки.
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
              <span className="text-sm text-muted-foreground">Номер на поръчка</span>
              <span className="font-mono font-bold text-primary">{order.id}</span>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              {order.cart.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
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
                <p className="text-sm text-muted-foreground mb-1">Запазена консултация</p>
                <p className="font-medium">
                  {order.consultation.date} в {order.consultation.time}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      <Card className="bg-primary/5 border-primary/20 mb-8">
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">Какво следва?</h2>
          <ol className="text-left space-y-3">
            <li className="flex items-start gap-3">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <span className="text-muted-foreground">Ще получите имейл с потвърждение на поръчката</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <span className="text-muted-foreground">
                {order?.consultation
                  ? `Консултацията ви е потвърдена за ${order.consultation.date} в ${order.consultation.time}`
                  : "Наш екип ще прегледа материалите и ще се свърже с вас"}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <span className="text-muted-foreground">Стартираме работа по вашия проект</span>
            </li>
          </ol>
        </CardContent>
      </Card>

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

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {session?.user?.role === "customer" ? (
          <TransitionLink href="/user">
            <Button size="lg" className="glow-primary">
              Към моя панел
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </TransitionLink>
        ) : null}
        <TransitionLink href="/">
          <Button variant="outline" size="lg">
            <Home className="mr-2 h-5 w-5" />
            Към началото
          </Button>
        </TransitionLink>
        <TransitionLink href="/#services">
          <Button size="lg" variant="secondary">
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
