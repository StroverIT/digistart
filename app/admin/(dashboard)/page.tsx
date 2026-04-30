"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  TrendingUp,
  Users,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import type { Order, DailyStats, ServiceStats } from "@/lib/types";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { ServicesPieChart } from "@/components/admin/services-pie-chart";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  trend?: string;
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-4 pt-4 border-t border-border">
            <span className="text-sm text-green-500 font-medium">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [serviceStats, setServiceStats] = useState<ServiceStats[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/checkout/orders")
      .then((response) => response.json())
      .then((data: { orders?: Order[] }) => {
        const allOrders = data.orders ?? [];
        setOrders(allOrders);

        const byDate = new Map<string, DailyStats>();
        for (let i = 13; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          byDate.set(dateStr, { date: dateStr, visits: 0, orders: 0, revenue: 0 });
        }
        for (const order of allOrders) {
          const dateStr = order.createdAt.split("T")[0];
          const row = byDate.get(dateStr);
          if (!row) continue;
          row.orders += 1;
          row.revenue += order.cart.totalOneTime + order.cart.totalMonthly;
        }
        setDailyStats(Array.from(byDate.values()));

        const byService = new Map<string, ServiceStats>();
        for (const order of allOrders) {
          for (const item of order.cart.items) {
            const current = byService.get(item.serviceId) ?? {
              serviceId: item.serviceId,
              serviceName: item.serviceName,
              orderCount: 0,
              revenue: 0,
            };
            current.orderCount += 1;
            current.revenue += item.totalPrice;
            byService.set(item.serviceId, current);
          }
        }
        setServiceStats(Array.from(byService.values()));
      })
      .catch(() => {
        setOrders([]);
        setDailyStats([]);
        setServiceStats([]);
      });
  }, []);

  if (!mounted) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.cart.totalOneTime + order.cart.totalMonthly,
    0
  );
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Табло</h1>
        <p className="text-muted-foreground">
          Преглед на вашия бизнес и последни поръчки
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Общо приходи"
          value={<Price value={totalRevenue} layout="vertical" />}
          description="Всички времена"
          icon={<CreditCard className="h-6 w-6" />}
          trend="+12% от миналия месец"
        />
        <StatCard
          title="Общо поръчки"
          value={orders.length.toString()}
          description={`${pendingOrders} чакащи`}
          icon={<ShoppingBag className="h-6 w-6" />}
        />
        <StatCard
          title="Завършени"
          value={completedOrders.toString()}
          description="Успешно доставени"
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <StatCard
          title="Клиенти"
          value={new Set(orders.map((o) => o.customer.email)).size.toString()}
          description="Уникални клиенти"
          icon={<Users className="h-6 w-6" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Приходи (последни 14 дни)</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={dailyStats} />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Поръчки по услуга</CardTitle>
          </CardHeader>
          <CardContent>
            <ServicesPieChart data={serviceStats} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Последни поръчки</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Няма поръчки
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
                      Статус
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Сума
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm font-medium">
                          {order.id}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{order.customer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.customer.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        <Price value={order.cart.totalOneTime + order.cart.totalMonthly} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: Order["status"] }) {
  const statusConfig = {
    pending: { label: "Чакаща", className: "bg-yellow-500/10 text-yellow-500" },
    paid: { label: "Платена", className: "bg-blue-500/10 text-blue-500" },
    in_progress: { label: "В процес", className: "bg-purple-500/10 text-purple-500" },
    completed: { label: "Завършена", className: "bg-green-500/10 text-green-500" },
    cancelled: { label: "Отказана", className: "bg-red-500/10 text-red-500" },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
