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
import { CheckoutFunnelChart } from "@/components/admin/checkout-funnel-chart";
import { SurveyCombinationsChart } from "@/components/admin/survey-combinations-chart";
import { ViewsPerDayChart } from "@/components/admin/views-per-day-chart";
import { ServiceSlotsPanel } from "@/components/admin/service-slots-panel";
import { DigitalRoadmapLeadsPanel } from "@/components/admin/digital-roadmap-leads-panel";
import { TargetAudienceLeadsPanel } from "@/components/admin/target-audience-leads-panel";
import { DashboardSectionHeading } from "@/components/admin/dashboard-section-heading";
import { UserDecisionsPanel } from "@/components/admin/user-decisions-panel";
import { CtaClicksPanel } from "@/components/admin/cta-clicks-panel";
import { FunnelAudienceViewsPanel } from "@/components/admin/funnel-audience-views-panel";
import { ConsultationSourcesPanel } from "@/components/admin/consultation-sources-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DASHBOARD_TABS = [
  { id: "overview", label: "Преглед" },
  { id: "engagement", label: "Ангажираност" },
  { id: "funnels", label: "Funnels" },
  { id: "revenue", label: "Приходи" },
  { id: "traffic", label: "Трафик" },
  { id: "conversion", label: "Конверсия" },
  { id: "operations", label: "Операции" },
] as const;

type DashboardTabId = (typeof DASHBOARD_TABS)[number]["id"];

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  trend?: string;
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card data-admin-animate className="bg-card border-border">
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

export function AdminDashboard({ initialTab }: { initialTab?: DashboardTabId }) {
  const dashboardRootRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<DashboardTabId>(initialTab ?? "overview");
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
    surveyStats: [],
    funnelCompetitorStats: [],
    funnelAudienceViews: {
      allTimeTotal: 0,
      lastDaysTotal: 0,
      bySegment: [],
      byFunnel: [],
      dailyTotals: [],
      dailyBySegment: [],
    },
    consultationSources: {
      allTimeTotal: 0,
      lastDaysTotal: 0,
      bySegment: [],
      byPage: [],
      dailyTotals: [],
      dailyBySegment: [],
    },
    surveyCombinations: {
      byCombo: [],
      dailyTotals: [],
      dailyByCombo: [],
      topDay: null,
    },
    checkoutFunnel: {
      allTimeStarted: 0,
      lastDaysStarted: 0,
      stages: [],
      dailyStarts: [],
      dailyByStage: [],
    },
  });
  const [revenueFromDate, setRevenueFromDate] = useState(() => getDateBefore(13));
  const [revenueToDate, setRevenueToDate] = useState(() => getTodayDateKey());
  const [subscriptionsFromDate, setSubscriptionsFromDate] = useState(() => getDateBefore(13));
  const [subscriptionsToDate, setSubscriptionsToDate] = useState(() => getTodayDateKey());
  const [viewsFromDate, setViewsFromDate] = useState(() => getDateBefore(13));
  const [viewsToDate, setViewsToDate] = useState(() => getTodayDateKey());
  const [viewsPeriodData, setViewsPeriodData] = useState<AnalyticsAdminResponse | null>(null);
  const [viewsPeriodLoading, setViewsPeriodLoading] = useState(false);

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
            surveyStats: [],
            funnelCompetitorStats: [],
            funnelAudienceViews: {
              allTimeTotal: 0,
              lastDaysTotal: 0,
              bySegment: [],
              byFunnel: [],
              dailyTotals: [],
              dailyBySegment: [],
            },
            consultationSources: {
              allTimeTotal: 0,
              lastDaysTotal: 0,
              bySegment: [],
              byPage: [],
              dailyTotals: [],
              dailyBySegment: [],
            },
            surveyCombinations: {
              byCombo: [],
              dailyTotals: [],
              dailyByCombo: [],
              topDay: null,
            },
            checkoutFunnel: {
              allTimeStarted: 0,
              lastDaysStarted: 0,
              stages: [],
              dailyStarts: [],
              dailyByStage: [],
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
    if (!viewsFromDate || !viewsToDate || viewsFromDate > viewsToDate) {
      setViewsPeriodData(null);
      setViewsPeriodLoading(false);
      return;
    }

    const controller = new AbortController();
    setViewsPeriodLoading(true);
    const { fromIso, toIso } = dateKeysToInclusiveUtcRange(viewsFromDate, viewsToDate);
    const params = new URLSearchParams({ from: fromIso, to: toIso });

    fetch(`/api/admin/analytics?${params}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("analytics"))))
      .then((data: AnalyticsAdminResponse) => setViewsPeriodData(data))
      .catch((error: unknown) => {
        if (
          error &&
          typeof error === "object" &&
          "name" in error &&
          (error as { name: string }).name === "AbortError"
        ) {
          return;
        }
        setViewsPeriodData(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setViewsPeriodLoading(false);
      });

    return () => controller.abort();
  }, [mounted, viewsFromDate, viewsToDate]);

  const viewsRangeDaily = useMemo(
    () =>
      viewsPeriodData
        ? buildViewsDailyStats(viewsPeriodData.dailyStats, viewsFromDate, viewsToDate)
        : [],
    [viewsPeriodData, viewsFromDate, viewsToDate]
  );

  const viewsRangeTotal = useMemo(
    () => viewsRangeDaily.reduce((sum, row) => sum + row.visits, 0),
    [viewsRangeDaily]
  );

  const viewsByPageSorted = useMemo(() => {
    if (!viewsPeriodData?.pageStats.length) return [];
    return [...viewsPeriodData.pageStats].sort((a, b) => b.views - a.views);
  }, [viewsPeriodData]);

  useEffect(() => {
    if (!mounted) return;

    let ctx: gsap.Context | undefined;
    let cancelled = false;

    const frame = requestAnimationFrame(() => {
      if (cancelled) return;

      const root = dashboardRootRef.current;
      if (!root) return;

      const activePanel = root.querySelector<HTMLElement>(
        `[data-slot="tabs-content"][data-state="active"]`,
      );
      if (!activePanel) return;

      ctx = gsap.context(() => {
        const els = activePanel.querySelectorAll<HTMLElement>("[data-admin-animate]");
        if (!els.length) return;

        gsap.fromTo(
          els,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.04,
            ease: "power2.out",
            overwrite: "auto",
          },
        );
      }, activePanel);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      ctx?.revert();
    };
  }, [mounted, activeTab]);

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
      <div>
        <h1 className="text-3xl font-bold mb-2">Табло</h1>
        <p className="text-muted-foreground">
          Преглед на вашия бизнес - изберете секция от табовете по-долу
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as DashboardTabId)}
        className="space-y-6"
      >
        <div className="overflow-x-auto pb-1 -mx-1 px-1">
          <TabsList className="inline-flex h-auto w-max min-w-full flex-wrap justify-start gap-1 p-1 sm:min-w-0">
            {DASHBOARD_TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="px-3 py-1.5">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 mt-0">
          <DashboardSectionHeading
            title="Преглед"
            description="Основни показатели за бизнеса"
          />
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              title="Клиенти"
              value={new Set(orders.map((o) => o.customer.email)).size.toString()}
              description="Уникални клиенти"
              icon={<Users className="h-6 w-6" />}
            />
            <StatCard
              title="Добавяния в кошницата"
              value={analytics.cartAdditions.allTimeTotalAdds.toString()}
              description={`${analytics.cartAdditions.lastDaysTotalAdds} за 30 дни`}
              icon={<ShoppingBag className="h-6 w-6" />}
            />
          </div>

          <DashboardSectionHeading
            title="Последни поръчки"
            description="Най-новите поръчки в системата"
          />
          <Card
            data-admin-animate
            className="bg-card border-border"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Поръчки</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Няма поръчки</p>
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
                        <tr key={order.id} className="border-b border-border last:border-0">
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm font-medium">{order.id}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{order.customer.name}</p>
                              <p className="text-sm text-muted-foreground">{order.customer.email}</p>
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

        </TabsContent>

        <TabsContent value="engagement" className="space-y-6 mt-0">
          <DashboardSectionHeading
            title="Решения и ангажираност"
            description="Какво избират посетителите и кои бутони кликат най-често"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="CTA кликове"
              value={analytics.totalClicks.toString()}
              description="Общо записани кликове"
              icon={<TrendingUp className="h-6 w-6" />}
            />
            <StatCard
              title="Общо посещения"
              value={analytics.dailyStats.reduce((sum, row) => sum + row.visits, 0).toString()}
              description="Реални page views"
              icon={<Users className="h-6 w-6" />}
            />
          </div>
          <CtaClicksPanel ctaStats={analytics.ctaStats} totalClicks={analytics.totalClicks} />

          <Card
            data-admin-animate
            className="bg-card border-border"
          >
            <CardHeader>
              <CardTitle>Въпросник посетители</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {analytics.surveyCombinations.byCombo.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Няма завършени комбинации от въпросника. Новите завършени анкети ще се показват тук с
                  кодове A, B, C...
                </p>
              ) : (
                <>
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Комбинации (легенда)</h3>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {analytics.surveyCombinations.byCombo.map((combo) => (
                        <div
                          key={combo.comboKey}
                          className="rounded-md border border-border p-3 flex flex-wrap items-baseline justify-between gap-2"
                        >
                          <p>
                            <span className="font-bold text-primary mr-2">{combo.code}</span>
                            <span className="text-muted-foreground">=</span>{" "}
                            <span className="font-medium">{combo.label}</span>
                          </p>
                          <p className="font-semibold tabular-nums shrink-0">
                            {combo.code} = {combo.count} пъти
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-3">Отговори по дни</h3>
                    <SurveyCombinationsChart
                      dailyTotals={analytics.surveyCombinations.dailyTotals}
                      dailyByCombo={analytics.surveyCombinations.dailyByCombo}
                      combos={analytics.surveyCombinations.byCombo}
                    />
                  </div>

                  {analytics.surveyCombinations.topDay ? (
                    <div className="rounded-lg border border-border p-4 space-y-3">
                      <h3 className="text-sm font-semibold">Най-силен ден</h3>
                      <p className="text-muted-foreground text-sm">
                        {new Date(analytics.surveyCombinations.topDay.date).toLocaleDateString("bg-BG", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}{" "}
                        - {analytics.surveyCombinations.topDay.totalResponses} завършени отговора
                      </p>
                      <div className="space-y-2">
                        {analytics.surveyCombinations.topDay.combinations.map((row) => (
                          <div
                            key={row.comboKey}
                            className="flex items-center justify-between rounded-md border border-border/60 p-2 text-sm"
                          >
                            <p>
                              <span className="font-bold text-primary mr-2">{row.code}</span>
                              {row.label}
                            </p>
                            <p className="font-semibold tabular-nums">{row.count}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              )}

              {analytics.surveyStats.length > 0 ? (
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold mb-4">По отделни въпроси</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                        Инвестиция в бизнеса
                      </h4>
                      <div className="space-y-2">
                        {analytics.surveyStats
                          .filter((s) => s.question === "business_investment")
                          .map((entry) => (
                            <div
                              key={entry.answer}
                              className="flex items-center justify-between rounded-md border border-border p-3"
                            >
                              <p className="font-medium text-sm">
                                {entry.answer === "yes"
                                  ? "Да"
                                  : entry.answer === "no"
                                    ? "Не"
                                    : entry.answer}
                              </p>
                              <p className="text-primary font-semibold">{entry.count}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                        Къде продавате
                      </h4>
                      <div className="space-y-2">
                        {analytics.surveyStats
                          .filter((s) => s.question === "sales_channels")
                          .map((entry) => (
                            <div
                              key={`${entry.answer}-${entry.otherLabel ?? ""}`}
                              className="flex items-center justify-between rounded-md border border-border p-3"
                            >
                              <p className="font-medium text-sm">
                                {entry.answer === "other" && entry.otherLabel
                                  ? `Друго: ${entry.otherLabel}`
                                  : entry.answer}
                              </p>
                              <p className="text-primary font-semibold">{entry.count}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                        Поръчки на месец
                      </h4>
                      <div className="space-y-2">
                        {analytics.surveyStats
                          .filter((s) => s.question === "monthly_orders")
                          .map((entry) => (
                            <div
                              key={entry.answer}
                              className="flex items-center justify-between rounded-md border border-border p-3"
                            >
                              <p className="font-medium text-sm">{entry.answer}</p>
                              <p className="text-primary font-semibold">{entry.count}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                        Интерес към услуги
                      </h4>
                      <div className="space-y-2">
                        {analytics.surveyStats
                          .filter((s) => s.question === "service_interest")
                          .map((entry) => (
                            <div
                              key={entry.answer}
                              className="flex items-center justify-between rounded-md border border-border p-3"
                            >
                              <p className="font-medium text-sm">{entry.answer}</p>
                              <p className="text-primary font-semibold">{entry.count}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="funnels" className="space-y-6 mt-0">
          <DashboardSectionHeading
            title="Funnels"
            description="Прегледи на аудитория funnel страници и платформени въпросници"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Денонощна машина"
              value={analytics.funnelAudienceViews.allTimeTotal.toString()}
              description={`${analytics.funnelAudienceViews.lastDaysTotal} за 30 дни`}
              icon={<Users className="h-6 w-6" />}
            />
            <StatCard
              title="Искам да продавам"
              value={(
                analytics.funnelAudienceViews.bySegment.find((entry) => entry.segment === "starting")?.views ?? 0
              ).toString()}
              description="Общо прегледи"
              icon={<TrendingUp className="h-6 w-6" />}
            />
            <StatCard
              title="Вече продавам"
              value={(
                analytics.funnelAudienceViews.bySegment.find((entry) => entry.segment === "selling")?.views ?? 0
              ).toString()}
              description="Общо прегледи"
              icon={<ShoppingBag className="h-6 w-6" />}
            />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <FunnelAudienceViewsPanel stats={analytics.funnelAudienceViews} />
            <ConsultationSourcesPanel stats={analytics.consultationSources} />
          </div>
          <UserDecisionsPanel funnelCompetitorStats={analytics.funnelCompetitorStats} />

        </TabsContent>

        <TabsContent value="revenue" className="space-y-6 mt-0">
          <DashboardSectionHeading
            title="Приходи и абонаменти"
            description="Финансови тенденции по период"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card
              data-admin-animate
              className="bg-card border-border"
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
              className="bg-card border-border"
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
              className="bg-card border-border"
            >
              <CardHeader>
                <CardTitle>Поръчки по услуга</CardTitle>
              </CardHeader>
              <CardContent>
                <ServicesPieChart data={serviceStats} />
              </CardContent>
            </Card>
          </div>

        </TabsContent>

        <TabsContent value="traffic" className="space-y-6 mt-0">
          <DashboardSectionHeading
            title="Трафик и маркетинг"
            description="UTM източници, кампании и посещения"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card
              data-admin-animate
              className="bg-card border-border"
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
              className="bg-card border-border"
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
              className="bg-card border-border"
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
              className="bg-card border-border"
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
              className="bg-card border-border lg:col-span-2"
            >
              <CardHeader className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle>Посещения (page views) по дни</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Общо за периода:{" "}
                    <span className="font-semibold text-foreground tabular-nums">
                      {viewsPeriodLoading && viewsPeriodData === null
                        ? "…"
                        : viewsRangeTotal.toLocaleString("bg-BG")}
                    </span>
                    {viewsPeriodLoading && viewsPeriodData !== null ? (
                      <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent align-middle" />
                    ) : null}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="views-from">От</Label>
                    <Input
                      id="views-from"
                      type="date"
                      value={viewsFromDate}
                      max={viewsToDate}
                      onChange={(event) => setViewsFromDate(event.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="views-to">До</Label>
                    <Input
                      id="views-to"
                      type="date"
                      value={viewsToDate}
                      min={viewsFromDate}
                      onChange={(event) => setViewsToDate(event.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {viewsPeriodLoading && viewsPeriodData === null ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <>
                    <ViewsPerDayChart data={viewsRangeDaily} />
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-3">
                        Посещения по страница (за периода)
                      </h3>
                      {viewsByPageSorted.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          {viewsPeriodData === null && !viewsPeriodLoading
                            ? "Няма заредени данни за периода."
                            : "Няма page views за избрания период."}
                        </p>
                      ) : (
                        <div className="overflow-x-auto rounded-md border border-border">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border bg-muted/40">
                                <th className="text-left py-2 px-3">Страница</th>
                                <th className="text-right py-2 px-3">Views</th>
                                <th className="text-right py-2 px-3">Сесии</th>
                              </tr>
                            </thead>
                            <tbody>
                              {viewsByPageSorted.map((stat) => (
                                <tr key={stat.page} className="border-b border-border/50 last:border-0">
                                  <td className="py-2 px-3 font-mono text-xs break-all max-w-[min(28rem,55vw)]">
                                    {stat.page}
                                  </td>
                                  <td className="py-2 px-3 text-right tabular-nums">{stat.views}</td>
                                  <td className="py-2 px-3 text-right tabular-nums">{stat.uniqueSessions}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card
              data-admin-animate
              className="bg-card border-border"
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
              className="bg-card border-border lg:col-span-2"
            >
              <CardHeader>
                <CardTitle>UTM views по дни и събития</CardTitle>
              </CardHeader>
              <CardContent>
                <UtmDailyViewsChart data={analytics.utmDailyStats} />
              </CardContent>
            </Card>

            <Card
              data-admin-animate
              className="bg-card border-border lg:col-span-2"
            >
              <CardHeader>
                <CardTitle>Page views по страница (общо)</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.pageStats.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Няма analytics данни.</p>
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
                        {[...analytics.pageStats]
                          .sort((a, b) => b.views - a.views)
                          .map((stat) => (
                            <tr key={stat.page} className="border-b border-border/50">
                              <td className="py-2 font-mono text-xs break-all max-w-[min(20rem,50vw)]">
                                {stat.page}
                              </td>
                              <td className="py-2 text-right tabular-nums">{stat.views}</td>
                              <td className="py-2 text-right tabular-nums">{stat.uniqueSessions}</td>
                              <td className="py-2 text-right tabular-nums">{stat.ctaClicks}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </TabsContent>

        <TabsContent value="conversion" className="space-y-6 mt-0">
          <DashboardSectionHeading
            title="Конверсия"
            description="Кошница, checkout funnel и upsell комбинации"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Добавяния в кошницата"
              value={analytics.cartAdditions.allTimeTotalAdds.toString()}
              description={`${analytics.cartAdditions.lastDaysTotalAdds} за 30 дни`}
              icon={<ShoppingBag className="h-6 w-6" />}
            />
            <StatCard
              title="Checkout посещения"
              value={analytics.checkoutFunnel.allTimeStarted.toString()}
              description={`${analytics.checkoutFunnel.lastDaysStarted} за 30 дни`}
              icon={<CreditCard className="h-6 w-6" />}
            />
            <StatCard
              title="Достигнали плащане"
              value={(
                analytics.checkoutFunnel.stages.find((s) => s.stage === "payment")?.uniqueSessions ?? 0
              ).toString()}
              description={
                analytics.checkoutFunnel.allTimeStarted > 0
                  ? `${Math.round(
                    ((analytics.checkoutFunnel.stages.find((s) => s.stage === "payment")
                      ?.uniqueSessions ?? 0) /
                      analytics.checkoutFunnel.allTimeStarted) *
                    100,
                  )}% от checkout`
                  : "Етап плащане"
              }
              icon={<TrendingUp className="h-6 w-6" />}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card
              data-admin-animate
              className="bg-card border-border"
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
              className="bg-card border-border"
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
              className="bg-card border-border lg:col-span-2"
            >
              <CardHeader>
                <CardTitle>Checkout funnel</CardTitle>
                <p className="text-sm text-muted-foreground font-normal">
                  Уникални сесии по етап. „Акаунт“ се показва само за гости.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {analytics.checkoutFunnel.allTimeStarted === 0 ? (
                  <p className="text-muted-foreground text-sm">Няма данни за checkout funnel.</p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {analytics.checkoutFunnel.stages.map((entry) => {
                        const maxCount = Math.max(
                          ...analytics.checkoutFunnel.stages.map((s) => s.uniqueSessions),
                          1,
                        );
                        const barWidth = Math.round((entry.uniqueSessions / maxCount) * 100);
                        return (
                          <div key={entry.stage} className="rounded-md border border-border p-3">
                            <div className="flex items-center justify-between gap-4 mb-2">
                              <p className="font-medium">{entry.label}</p>
                              <div className="text-right">
                                <p className="text-primary font-semibold">
                                  {entry.uniqueSessions} сесии
                                </p>
                                {entry.dropOffFromPrevious !== null ? (
                                  <p className="text-xs text-muted-foreground">
                                    {entry.dropOffFromPrevious}% от предишния етап
                                  </p>
                                ) : null}
                              </div>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <CheckoutFunnelChart
                      dailyStarts={analytics.checkoutFunnel.dailyStarts}
                      dailyByStage={analytics.checkoutFunnel.dailyByStage}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            <Card
              data-admin-animate
              className="bg-card border-border lg:col-span-2"
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
          </div>

        </TabsContent>

        <TabsContent value="operations" className="space-y-6 mt-0">
          <DashboardSectionHeading
            title="Операции"
            description="Слотове, заявки и текущи задачи"
          />
          <ServiceSlotsPanel />
          <TargetAudienceLeadsPanel />
          <DigitalRoadmapLeadsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getTodayDateKey() {
  return new Date().toISOString().split("T")[0];
}

/** Local calendar day → inclusive UTC bounds for API `from` / `to` filters. */
function dateKeysToInclusiveUtcRange(fromKey: string, toKey: string) {
  const from = new Date(`${fromKey}T00:00:00`);
  const to = new Date(`${toKey}T23:59:59.999`);
  return { fromIso: from.toISOString(), toIso: to.toISOString() };
}

function getDateBefore(daysBeforeToday: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysBeforeToday);
  return date.toISOString().split("T")[0];
}


function buildViewsDailyStats(
  analyticsDays: { date: string; visits: number }[],
  fromDate: string,
  toDate: string
): { date: string; visits: number }[] {
  const byDate = new Map<string, number>();
  for (const row of analyticsDays) {
    byDate.set(row.date, row.visits);
  }
  return listDateRange(fromDate, toDate).map((dateKey) => ({
    date: dateKey,
    visits: byDate.get(dateKey) ?? 0,
  }));
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
