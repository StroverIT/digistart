"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { RefreshCw, History, CalendarClock, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import type { Order } from "@/lib/types";

type RecurringOrder = Order & { recurringReason: "subscription_id" | "monthly_total" };

function isRecurringOrder(order: Order): RecurringOrder | null {
  if (order.stripe?.subscriptionId) {
    return { ...order, recurringReason: "subscription_id" };
  }

  if (order.cart.totalMonthly > 0) {
    return { ...order, recurringReason: "monthly_total" };
  }

  return null;
}

export default function AdminSubscriptionsPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/checkout/orders")
      .then((response) => response.json())
      .then((data: { orders?: Order[] }) => {
        setOrders(data.orders ?? []);
      })
      .catch(() => {
        setOrders([]);
      });
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = pageRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const els = root.querySelectorAll<HTMLElement>("[data-admin-animate]");
      if (!els.length) return;
      gsap.set(els, { opacity: 0, y: 28, scale: 0.99 });
      gsap.to(els, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.45,
        stagger: 0.07,
        ease: "back.out(1.15)",
      });
    }, root);

    return () => ctx.revert();
  }, [mounted]);

  const recurringOrders = useMemo(() => {
    return orders.map(isRecurringOrder).filter((order): order is RecurringOrder => order !== null);
  }, [orders]);

  const activeRecurring = useMemo(() => {
    return recurringOrders.filter((order) =>
      ["paid", "in_progress", "completed"].includes(order.status)
    );
  }, [recurringOrders]);

  const recurringWithRenewDate = useMemo(() => {
    return recurringOrders.filter(
      (order) => order.stripe?.subscriptionId && order.stripe.checkoutCompletedAt
    );
  }, [recurringOrders]);

  const totalSubscriptionsMonthly = useMemo(() => {
    return recurringOrders.reduce((sum, order) => sum + order.cart.totalMonthly, 0);
  }, [recurringOrders]);

  if (!mounted) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div ref={pageRef} className="space-y-6">
      <div data-admin-animate className="opacity-0 translate-y-10">
        <h1 className="text-3xl font-bold mb-2">Recurring subscriptions</h1>
        <p className="text-muted-foreground">
          Проследяване на активни и исторически абонаментни поръчки
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card
          data-admin-animate
          className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              Активни сега
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeRecurring.length}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Статуси: paid, in_progress, completed
            </p>
          </CardContent>
        </Card>

        <Card
          data-admin-animate
          className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              Общо създадени (all-time)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{recurringOrders.length}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Всички поръчки, маркирани като recurring
            </p>
          </CardContent>
        </Card>

        <Card
          data-admin-animate
          className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              Със Stripe subscription ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {
                recurringOrders.filter((order) => Boolean(order.stripe?.subscriptionId))
                  .length
              }
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Потвърдени като subscription в Stripe
            </p>
          </CardContent>
        </Card>

        <Card
          data-admin-animate
          className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Обща сума абонаменти
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              <Price value={totalSubscriptionsMonthly} layout="vertical" />
            </p>
            <p className="text-sm text-muted-foreground mt-1">Сума на всички recurring месечни такси</p>
          </CardContent>
        </Card>
      </div>

      <Card
        data-admin-animate
        className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
      >
        <CardHeader>
          <CardTitle>Последни recurring поръчки</CardTitle>
        </CardHeader>
        <CardContent>
          {recurringOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Няма recurring поръчки
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Поръчка
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Клиент
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Причина за recurring
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Статус
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Месечно
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recurringOrders.slice(0, 20).map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4">
                        <p className="font-mono text-sm font-medium">{order.id}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.createdAt).toLocaleDateString("bg-BG")}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{order.customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer.email}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {order.recurringReason === "subscription_id"
                          ? "Stripe subscriptionId"
                          : "Monthly total > 0"}
                      </td>
                      <td className="py-3 px-4 text-sm">{order.status}</td>
                      <td className="py-3 px-4 text-right font-semibold">
                        <Price value={order.cart.totalMonthly} /> /мес
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Записи със Stripe subscription и checkout timestamp: {recurringWithRenewDate.length}
      </p>
    </div>
  );
}
