"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import {
  ShoppingBag,
  TrendingUp,
  Users,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Price } from "@/components/ui/price";
import type { Order, DailyStats, ServiceStats } from "@/lib/types";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { ServicesPieChart } from "@/components/admin/services-pie-chart";
import { SubscriptionsChart } from "@/components/admin/subscriptions-chart";
import { UtmDailyViewsChart } from "@/components/admin/utm-daily-views-chart";
import { UtmMonthlyViewsChart } from "@/components/admin/utm-monthly-views-chart";
import type { AnalyticsAdminResponse } from "@/lib/analytics/types";
import { CartAdditionsChart } from "@/components/admin/cart-additions-chart";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  trend?: string;
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card
      data-admin-animate
      className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
    >
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
  const dashboardRootRef = useRef<HTMLDivElement>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceStats, setServiceStats] = useState<ServiceStats[]>([]);
  const [mounted, setMounted] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsAdminResponse>({
    pageStats: [],
    ctaStats: [],
    totalClicks: 0,
    dailyStats: [],
    utmDailyStats: [],
    utmMonthlyStats: [],
    utmSources: [],
    utmMediums: [],
    utmCampaigns: [],
    utmLandingUrls: [],
    cartAdditions: {
      allTimeTotalAdds: 0,
      lastDaysTotalAdds: 0,
      dailyTotals: [],
      dailyByCombo: [],
      byService: [],
      byCombo: [],
    },
  });
  const [revenueFromDate, setRevenueFromDate] = useState(() => getDateBefore(13));
  const [revenueToDate, setRevenueToDate] = useState(() => getTodayDateKey());
  const [subscriptionsFromDate, setSubscriptionsFromDate] = useState(() => getDateBefore(13));
  const [subscriptionsToDate, setSubscriptionsToDate] = useState(() => getTodayDateKey());

  useEffect(() => {
    setMounted(true);
    Promise.all([
      fetch("/api/checkout/orders").then((response) => response.json()),
      fetch("/api/admin/analytics").then((response) =>
        response.ok ? response.json() : Promise.resolve(null),
      ),
    ])
      .then(([ordersData, analyticsData]: [{ orders?: Order[] }, AnalyticsAdminResponse | null]) => {
        const allOrders = ordersData.orders ?? [];
        setOrders(allOrders);
        setAnalytics(
          analyticsData ?? {
            pageStats: [],
            ctaStats: [],
            totalClicks: 0,
            dailyStats: [],
            utmDailyStats: [],
            utmMonthlyStats: [],
            utmSources: [],
            utmMediums: [],
            utmCampaigns: [],
            utmLandingUrls: [],
            cartAdditions: {
              allTimeTotalAdds: 0,
              lastDaysTotalAdds: 0,
              dailyTotals: [],
              dailyByCombo: [],
              byService: [],
              byCombo: [],
            },
          },
        );

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
        setServiceStats([]);
      });
  }, []);

  const revenueStats = useMemo(
    () =>
      buildRevenueDailyStats(orders, analytics.dailyStats, revenueFromDate, revenueToDate),
    [orders, analytics.dailyStats, revenueFromDate, revenueToDate]
  );

  const subscriptionsStats = useMemo(
    () =>
      buildSubscriptionDailyStats(
        orders,
        subscriptionsFromDate,
        subscriptionsToDate
      ),
    [orders, subscriptionsFromDate, subscriptionsToDate]
  );

  useEffect(() => {
    if (!mounted) return;
    const root = dashboardRootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const els = root.querySelectorAll<HTMLElement>("[data-admin-animate]");
      if (!els.length) return;
      gsap.set(els, { opacity: 0, y: 32, scale: 0.98 });
      gsap.to(els, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.07,
        ease: "back.out(1.2)",
      });
    }, root);

    return () => ctx.revert();
  }, [mounted]);

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
    <div ref={dashboardRootRef} className="space-y-8">
      {/* Header */}
      <div data-admin-animate className="opacity-0 translate-y-10">
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
          title="Общо посещения"
          value={analytics.dailyStats.reduce((sum, row) => sum + row.visits, 0).toString()}
          description="Реални page views"
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Клиенти"
          value={new Set(orders.map((o) => o.customer.email)).size.toString()}
          description="Уникални клиенти"
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Добавяния в кошницата"
          value={analytics.cartAdditions.allTimeTotalAdds.toString()}
          description="Всички времена"
          icon={<ShoppingBag className="h-6 w-6" />}
        />
        <StatCard
          title="Добавяния (30 дни)"
          value={analytics.cartAdditions.lastDaysTotalAdds.toString()}
          description="Последните 30 дни"
          icon={<TrendingUp className="h-6 w-6" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          data-admin-animate
          className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
        >
          <CardHeader>
            <CardTitle>UTM Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.utmSources.length === 0 ? (
              <p className="text-muted-foreground text-sm">Няма source данни.</p>
            ) : (
              <div className="space-y-2">
                {analytics.utmSources.slice(0, 10).map((entry) => (
                  <div key={entry.key} className="flex items-center justify-between rounded-md border border-border p-3">
                    <p className="font-medium">{entry.key}</p>
                    <p className="text-primary font-semibold">{entry.views} views</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          data-admin-animate
          className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
        >
          <CardHeader>
            <CardTitle>UTM Mediums</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.utmMediums.length === 0 ? (
              <p className="text-muted-foreground text-sm">Няма medium данни.</p>
            ) : (
              <div className="space-y-2">
                {analytics.utmMediums.slice(0, 10).map((entry) => (
                  <div key={entry.key} className="flex items-center justify-between rounded-md border border-border p-3">
                    <p className="font-medium">{entry.key}</p>
                    <p className="text-primary font-semibold">{entry.views} views</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          data-admin-animate
          className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
        >
          <CardHeader>
            <CardTitle>UTM Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.utmCampaigns.length === 0 ? (
              <p className="text-muted-foreground text-sm">Няма campaign данни.</p>
            ) : (
              <div className="space-y-2">
                {analytics.utmCampaigns.slice(0, 10).map((entry) => (
                  <div key={entry.key} className="flex items-center justify-between rounded-md border border-border p-3">
                    <p className="font-medium">{entry.key}</p>
                    <p className="text-primary font-semibold">{entry.views} views</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          data-admin-animate
          className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
        >
          <CardHeader>
            <CardTitle>UTM Landing URLs</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.utmLandingUrls.length === 0 ? (
              <p className="text-muted-foreground text-sm">Няма landing URL данни.</p>
            ) : (
              <div className="space-y-2">
                {analytics.utmLandingUrls.slice(0, 10).map((entry) => (
                  <div key={entry.key} className="rounded-md border border-border p-3">
                    <p className="font-medium break-all">{entry.key}</p>
                    <p className="text-primary font-semibold">{entry.views} views</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          data-admin-animate
          className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
        >
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle>Приходи по дни</CardTitle>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="revenue-from">От</Label>
                <Input
                  id="revenue-from"
                  type="date"
                  value={revenueFromDate}
                  max={revenueToDate}
                  onChange={(event) => setRevenueFromDate(event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="revenue-to">До</Label>
                <Input
                  id="revenue-to"
                  type="date"
                  value={revenueToDate}
                  min={revenueFromDate}
                  onChange={(event) => setRevenueToDate(event.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueStats} />
          </CardContent>
        </Card>

        <Card
          data-admin-animate
          className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
        >
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle>Абонаменти по дни</CardTitle>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="subscriptions-from">От</Label>
                <Input
                  id="subscriptions-from"
                  type="date"
                  value={subscriptionsFromDate}
                  max={subscriptionsToDate}
                  onChange={(event) => setSubscriptionsFromDate(event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="subscriptions-to">До</Label>
                <Input
                  id="subscriptions-to"
                  type="date"
                  value={subscriptionsToDate}
                  min={subscriptionsFromDate}
                  onChange={(event) => setSubscriptionsToDate(event.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SubscriptionsChart data={subscriptionsStats} />
          </CardContent>
        </Card>

        <Card
          data-admin-animate
          className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
        >
          <CardHeader>
            <CardTitle>Добавяния в кошницата (30 дни)</CardTitle>
          </CardHeader>
          <CardContent>
            <CartAdditionsChart
              dailyTotals={analytics.cartAdditions.dailyTotals}
              dailyByCombo={analytics.cartAdditions.dailyByCombo}
              combos={analytics.cartAdditions.byCombo}
            />
          </CardContent>
        </Card>

        <Card
          data-admin-animate
          className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
        >
          <CardHeader>
            <CardTitle>Добавяния по услуга (общо)</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.cartAdditions.byService.length === 0 ? (
              <p className="text-muted-foreground text-sm">Няма данни за добавяния.</p>
            ) : (
              <div className="space-y-2">
                {analytics.cartAdditions.byService.slice(0, 12).map((entry) => (
                  <div
                    key={entry.serviceId}
                    className="flex items-center justify-between rounded-md border border-border p-3"
                  >
                    <p className="font-medium">{entry.serviceName}</p>
                    <p className="text-primary font-semibold">{entry.count} пъти</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          data-admin-animate
          className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
        >
          <CardHeader>
            <CardTitle>Поръчки по услуга</CardTitle>
          </CardHeader>
          <CardContent>
            <ServicesPieChart data={serviceStats} />
          </CardContent>
        </Card>

        <Card
          data-admin-animate
          className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
        >
          <CardHeader>
            <CardTitle>UTM views по месеци</CardTitle>
          </CardHeader>
          <CardContent>
            <UtmMonthlyViewsChart data={analytics.utmMonthlyStats} />
          </CardContent>
        </Card>

        <Card
          data-admin-animate
          className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)] lg:col-span-2"
        >
          <CardHeader>
            <CardTitle>Комбинации услуга + upsell (общо)</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.cartAdditions.byCombo.length === 0 ? (
              <p className="text-muted-foreground text-sm">Няма данни за upsell комбинации.</p>
            ) : (
              <div className="space-y-2">
                {analytics.cartAdditions.byCombo.slice(0, 20).map((entry) => (
                  <div key={entry.comboKey} className="rounded-md border border-border p-3">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium">{entry.serviceName}</p>
                      <p className="text-primary font-semibold">{entry.count} пъти</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{entry.comboLabel}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          data-admin-animate
          className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)] lg:col-span-2"
        >
          <CardHeader>
            <CardTitle>UTM views по дни и събития</CardTitle>
          </CardHeader>
          <CardContent>
            <UtmDailyViewsChart data={analytics.utmDailyStats} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          data-admin-animate
          className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
        >
          <CardHeader>
            <CardTitle>UTM event breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.utmDailyStats.length === 0 ? (
              <p className="text-muted-foreground text-sm">Няма UTM събития.</p>
            ) : (
              <div className="space-y-2">
                {analytics.utmDailyStats.slice(0, 10).map((entry) => (
                  <div
                    key={`${entry.date}-${entry.utmSource}-${entry.utmMedium}-${entry.utmCampaign}`}
                    className="rounded-md border border-border p-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium">
                        {entry.utmSource} / {entry.utmMedium}
                      </p>
                      <p className="text-primary font-semibold">{entry.views} views</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {entry.date} - {entry.utmCampaign}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          data-admin-animate
          className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
        >
          <CardHeader>
            <CardTitle>Page Views и CTA</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.pageStats.length === 0 ? (
              <p className="text-muted-foreground text-sm">Няма analytics данни за избрания период.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2">Страница</th>
                      <th className="text-right py-2">Views</th>
                      <th className="text-right py-2">Сесии</th>
                      <th className="text-right py-2">CTA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.pageStats.slice(0, 10).map((stat) => (
                      <tr key={stat.page} className="border-b border-border/50">
                        <td className="py-2">{stat.page}</td>
                        <td className="py-2 text-right">{stat.views}</td>
                        <td className="py-2 text-right">{stat.uniqueSessions}</td>
                        <td className="py-2 text-right">{stat.ctaClicks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          data-admin-animate
          className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
        >
          <CardHeader>
            <CardTitle>Най-кликани CTA</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.ctaStats.length === 0 ? (
              <p className="text-muted-foreground text-sm">Няма CTA кликове.</p>
            ) : (
              <div className="space-y-2">
                {analytics.ctaStats.slice(0, 10).map((cta) => (
                  <div key={`${cta.page}-${cta.ctaId}`} className="rounded-md border border-border p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{cta.ctaId}</p>
                      <p className="text-primary font-semibold">{cta.clicks} клика</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{cta.page}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card
        data-admin-animate
        className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
      >
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

function getTodayDateKey() {
  return new Date().toISOString().split("T")[0];
}

function getDateBefore(daysBeforeToday: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysBeforeToday);
  return date.toISOString().split("T")[0];
}


function buildRevenueDailyStats(
  orders: Order[],
  analyticsDays: { date: string; visits: number }[],
  fromDate: string,
  toDate: string
): DailyStats[] {
  const byDate = new Map<string, DailyStats>();

  for (const dateKey of listDateRange(fromDate, toDate)) {
    const visits = analyticsDays.find((entry) => entry.date === dateKey)?.visits ?? 0;
    byDate.set(dateKey, { date: dateKey, visits, orders: 0, revenue: 0 });
  }

  for (const order of orders) {
    const dateStr = order.createdAt.split("T")[0];
    const row = byDate.get(dateStr);
    if (!row) continue;
    row.orders += 1;
    row.revenue += order.cart.totalOneTime + order.cart.totalMonthly;
  }

  return Array.from(byDate.values());
}

interface DailySubscriptionStats {
  date: string;
  subscriptions: number;
  monthlyRevenue: number;
}

function buildSubscriptionDailyStats(
  orders: Order[],
  fromDate: string,
  toDate: string
): DailySubscriptionStats[] {
  const byDate = new Map<string, DailySubscriptionStats>();

  for (const dateKey of listDateRange(fromDate, toDate)) {
    byDate.set(dateKey, { date: dateKey, subscriptions: 0, monthlyRevenue: 0 });
  }

  for (const order of orders) {
    if (!isSubscriptionOrder(order)) continue;
    const dateStr = order.createdAt.split("T")[0];
    const row = byDate.get(dateStr);
    if (!row) continue;
    row.subscriptions += 1;
    row.monthlyRevenue += order.cart.totalMonthly;
  }

  return Array.from(byDate.values());
}

function isSubscriptionOrder(order: Order) {
  return (
    order.stripe?.checkoutMode === "subscription" ||
    Boolean(order.stripe?.subscriptionId) ||
    order.cart.totalMonthly > 0
  );
}

function listDateRange(fromDate: string, toDate: string) {
  if (!fromDate || !toDate) return [];
  if (fromDate > toDate) return [];

  const dates: string[] = [];
  const current = new Date(fromDate);
  const end = new Date(toDate);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
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
