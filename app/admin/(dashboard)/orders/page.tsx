"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Image from "next/image";
import { Search, Filter, Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Price } from "@/components/ui/price";
import type { Order } from "@/lib/types";
import { getServiceById } from "@/lib/data/services";
import type { OrderAdminDetails } from "@/lib/server/order-admin-details";
import { ExternalLink, CheckCircle2, Circle } from "lucide-react";
import { PreviewLink } from "@/components/preview/preview-link";

const setupStatusLabels: Record<string, string> = {
  draft: "Чернова",
  in_progress: "В процес",
  live: "Активен",
};

const domainStatusLabels: Record<string, string> = {
  pending: "Изчаква DNS",
  configured: "Конфигуриран",
  misconfigured: "Грешна конфигурация",
};

const statusOptions: { value: Order["status"]; label: string }[] = [
  { value: "pending", label: "Чакаща" },
  { value: "paid", label: "Платена" },
  { value: "in_progress", label: "В процес" },
  { value: "completed", label: "Завършена" },
  { value: "cancelled", label: "Отказана" },
];

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderAdminDetails | null>(null);
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);
  const [resolvedPaymentIntentId, setResolvedPaymentIntentId] = useState<string | null>(null);
  const [isResolvingPaymentIntent, setIsResolvingPaymentIntent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ordersPageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/checkout/orders")
      .then((response) => response.json())
      .then((data: { orders?: Order[] }) => {
        const allOrders = data.orders ?? [];

        setOrders(allOrders);
        setFilteredOrders(allOrders);
      })
      .catch(() => {
        setOrders([]);
        setFilteredOrders([]);
      });
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(query) ||
          order.customer.name.toLowerCase().includes(query) ||
          order.customer.email.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    fetch("/api/checkout/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: newStatus }),
    })
      .then((response) => response.json())
      .then((data: { order?: Order }) => {
        if (!data.order) return;
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order! : o)));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(data.order);
        }
      })
      .catch(() => undefined);
  };


  useEffect(() => {
    if (!selectedOrder) {
      setOrderDetails(null);
      setIsLoadingOrderDetails(false);
      return;
    }

    setIsLoadingOrderDetails(true);
    fetch(`/api/admin/orders/${selectedOrder.id}`)
      .then((response) => response.json())
      .then((data: { details?: OrderAdminDetails }) => {
        setOrderDetails(data.details ?? null);
      })
      .catch(() => {
        setOrderDetails(null);
      })
      .finally(() => {
        setIsLoadingOrderDetails(false);
      });
  }, [selectedOrder]);

  useEffect(() => {
    if (!selectedOrder) {
      setResolvedPaymentIntentId(null);
      setIsResolvingPaymentIntent(false);
      return;
    }

    if (selectedOrder.stripe?.paymentIntentId) {
      setResolvedPaymentIntentId(selectedOrder.stripe.paymentIntentId);
      setIsResolvingPaymentIntent(false);
      return;
    }

    if (!selectedOrder.stripe?.checkoutSessionId && !selectedOrder.stripe?.subscriptionId) {
      setResolvedPaymentIntentId(null);
      setIsResolvingPaymentIntent(false);
      return;
    }

    setIsResolvingPaymentIntent(true);


    fetch(`/api/checkout/orders/${selectedOrder.id}/stripe-payment-intent`)
      .then((response) => response.json())
      .then((data: { paymentIntentId?: string | null }) => {
        setResolvedPaymentIntentId(data.paymentIntentId ?? null);

      })
      .catch(() => {
        setResolvedPaymentIntentId(null);
      })
      .finally(() => {
        setIsResolvingPaymentIntent(false);
      });
  }, [selectedOrder]);

  useEffect(() => {
    if (!mounted) return;
    const root = ordersPageRef.current;
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
        stagger: 0.08,
        ease: "back.out(1.15)",
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

  return (
    <div ref={ordersPageRef} className="space-y-6">
      {/* Header */}
      <div data-admin-animate className="opacity-0 translate-y-10">
        <h1 className="text-3xl font-bold mb-2">Поръчки</h1>
        <p className="text-muted-foreground">
          Управление на всички поръчки и тяхното състояние
        </p>
      </div>

      {/* Filters */}
      <Card
        data-admin-animate
        className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
      >
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Търсене по ID, име или имейл..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Филтър по статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички статуси</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card
        data-admin-animate
        className="bg-card border-border opacity-0 translate-y-10 [transform:translateZ(0)]"
      >
        <CardHeader>
          <CardTitle>
            {filteredOrders.length} поръчки
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Няма намерени поръчки
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
                      Услуги
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Статус
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Консултация
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Сума
                    </th>
                    <th className="py-3 px-4 text-sm font-medium text-muted-foreground">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm font-medium">
                          {order.id}
                        </span>
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
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {order.cart.items.map((item) => (
                            <span
                              key={item.id}
                              className="text-xs bg-secondary px-2 py-1 rounded"
                            >
                              {item.serviceName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-4">
                        {order.consultation ? (
                          <span className="text-xs">
                            {order.consultation.date} {order.consultation.time}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Няма</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Price
                          value={order.cart.totalOneTime + order.cart.totalMonthly}
                          className="font-semibold"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {statusOptions.map((option) => (
                                <DropdownMenuItem
                                  key={option.value}
                                  onClick={() =>
                                    handleStatusChange(order.id, option.value)
                                  }
                                  disabled={order.status === option.value}
                                >
                                  Маркирай като {option.label.toLowerCase()}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[min(90vh,800px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Детайли за поръчка {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {isLoadingOrderDetails ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Зареждане на онбординг данни...
                </div>
              ) : null}

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-2">Клиент</h3>
                <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  <p>
                    <span className="text-muted-foreground">Име:</span>{" "}
                    {selectedOrder.customer.name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Имейл:</span>{" "}
                    {selectedOrder.customer.email}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Телефон:</span>{" "}
                    {selectedOrder.customer.phone}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Фирма (поръчка):</span>{" "}
                    {selectedOrder.customer.company ?? "-"}
                  </p>
                  {orderDetails?.user?.company &&
                    orderDetails.user.company !== selectedOrder.customer.company ? (
                    <p>
                      <span className="text-muted-foreground">Фирма (акаунт):</span>{" "}
                      {orderDetails.user.company}
                    </p>
                  ) : null}
                  {orderDetails?.companyVat ? (
                    <p>
                      <span className="text-muted-foreground">ДДС / ЕИК:</span>{" "}
                      {orderDetails.companyVat}
                    </p>
                  ) : null}
                  {selectedOrder.customer.notes ? (
                    <p>
                      <span className="text-muted-foreground">Бележки:</span>{" "}
                      {selectedOrder.customer.notes}
                    </p>
                  ) : null}
                  <p>
                    <span className="text-muted-foreground">Stripe Payment ID:</span>{" "}
                    <span className="font-mono text-sm break-all">
                      {selectedOrder.stripe?.paymentIntentId ??
                        resolvedPaymentIntentId ??
                        (isResolvingPaymentIntent ? "Зареждане..." : "Няма")}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Stripe Reference ID:</span>{" "}
                    <span className="font-mono text-sm break-all">
                      {selectedOrder.stripe?.subscriptionId ??
                        selectedOrder.stripe?.checkoutSessionId ??
                        "Няма"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Onboarding */}
              {orderDetails?.onboarding.serviceSetup.length ? (
                <div>
                  <h3 className="font-semibold mb-2">Онбординг</h3>
                  <div className="bg-secondary/50 rounded-lg p-4 space-y-4">
                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">Статус:</span>{" "}
                        <span className="font-medium">
                          {orderDetails.onboarding.setupStatus
                            ? (setupStatusLabels[orderDetails.onboarding.setupStatus] ??
                              orderDetails.onboarding.setupStatus)
                            : "Не е започнат"}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Общ прогрес:</span>{" "}
                        <span
                          className={
                            orderDetails.onboarding.isComplete
                              ? "font-medium text-green-600"
                              : "font-medium text-amber-600"
                          }
                        >
                          {orderDetails.onboarding.isComplete ? "Завършен" : "Незавършен"}
                        </span>
                      </p>
                      {orderDetails.onboarding.onboardingStep != null ? (
                        <p>
                          <span className="text-muted-foreground">Стъпка:</span>{" "}
                          {orderDetails.onboarding.onboardingStep}
                        </p>
                      ) : null}
                      {orderDetails.productSalesTypeLabel ? (
                        <p>
                          <span className="text-muted-foreground">Тип продукти:</span>{" "}
                          {orderDetails.productSalesTypeLabel}
                        </p>
                      ) : null}
                      {orderDetails.selectedNicheLabels.length > 0 ? (
                        <p>
                          <span className="text-muted-foreground">Категории:</span>{" "}
                          {orderDetails.selectedNicheLabels.join(", ")}
                        </p>
                      ) : null}
                    </div>

                    {orderDetails.template ? (
                      <div className="rounded-md border border-border bg-background/60 p-3 text-sm">
                        <p className="text-muted-foreground mb-1">Избран шаблон</p>
                        <p className="font-medium">{orderDetails.template.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          ID: {orderDetails.template.id}
                        </p>
                        {orderDetails.template.previewPath ? (
                          <PreviewLink
                            href={orderDetails.template.previewPath}
                            ctaId="admin_order_template_preview"
                            ctaPage="/admin/orders"
                            className="mt-2 inline-flex items-center gap-1 text-primary underline text-sm"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Преглед на шаблона
                          </PreviewLink>
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Шаблон: не е избран
                      </p>
                    )}

                    {orderDetails.project?.businessSettings &&
                      Object.keys(orderDetails.project.businessSettings).length > 0 ? (
                      <div>
                        <p className="text-sm font-medium mb-2">Данни за бизнеса</p>
                        <div className="space-y-1 text-sm">
                          {orderDetails.project.businessSettings.businessName ? (
                            <p>
                              <span className="text-muted-foreground">Име:</span>{" "}
                              {String(orderDetails.project.businessSettings.businessName)}
                            </p>
                          ) : null}
                          {orderDetails.project.businessSettings.phone ? (
                            <p>
                              <span className="text-muted-foreground">Телефон:</span>{" "}
                              {String(orderDetails.project.businessSettings.phone)}
                            </p>
                          ) : null}
                          {orderDetails.project.businessSettings.email ? (
                            <p>
                              <span className="text-muted-foreground">Имейл:</span>{" "}
                              {String(orderDetails.project.businessSettings.email)}
                            </p>
                          ) : null}
                          {orderDetails.project.businessSettings.productNotes ? (
                            <p>
                              <span className="text-muted-foreground">Продукти / бележки:</span>{" "}
                              {String(orderDetails.project.businessSettings.productNotes)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : null}

                    {orderDetails.project?.socialSettings &&
                      (Array.isArray(orderDetails.project.socialSettings.channels) ||
                        orderDetails.project.socialSettings.googleBusinessUrl) ? (
                      <div>
                        <p className="text-sm font-medium mb-2">Социални мрежи</p>
                        {typeof orderDetails.project.socialSettings.googleBusinessUrl ===
                          "string" &&
                          orderDetails.project.socialSettings.googleBusinessUrl ? (
                          <p className="text-sm break-all mb-2">
                            <span className="text-muted-foreground">Google Business: </span>
                            {orderDetails.project.socialSettings.googleBusinessUrl}
                          </p>
                        ) : null}
                        {Array.isArray(orderDetails.project.socialSettings.channels) &&
                          orderDetails.project.socialSettings.channels.length > 0 ? (
                          <ul className="space-y-1 text-sm">
                            {(
                              orderDetails.project.socialSettings.channels as Array<
                                Record<string, unknown>
                              >
                            ).map((channel, index) => (
                              <li key={index} className="break-all">
                                {typeof channel.label === "string" && channel.label
                                  ? `${channel.label}: `
                                  : `Канал ${index + 1}: `}
                                {String(channel.profileUrl ?? "")}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}

                    {orderDetails.domains.length > 0 ? (
                      <div>
                        <p className="text-sm font-medium mb-2">Домейн</p>
                        <ul className="space-y-2 text-sm">
                          {orderDetails.domains.map((domain) => (
                            <li
                              key={domain.orderItemId}
                              className="rounded-md border border-border bg-background/60 p-2"
                            >
                              <p className="font-medium break-all">{domain.domain}</p>
                              <p className="text-muted-foreground">
                                Статус:{" "}
                                {domainStatusLabels[domain.status] ?? domain.status}
                              </p>
                              {domain.adminNotes ? (
                                <p className="text-muted-foreground mt-1">
                                  Бележки: {domain.adminNotes}
                                </p>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {orderDetails.project?.gmailConnectedAt ? (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Gmail:</span> свързан (
                        {new Date(orderDetails.project.gmailConnectedAt).toLocaleString("bg-BG")})
                      </p>
                    ) : null}

                    {orderDetails.project?.dbMigrationNotes ? (
                      <div>
                        <p className="text-sm font-medium mb-1">Бележки за миграция</p>
                        <p className="text-sm rounded-md bg-background/60 p-2">
                          {orderDetails.project.dbMigrationNotes}
                        </p>
                      </div>
                    ) : null}

                    <div className="space-y-3 pt-2 border-t border-border">
                      {orderDetails.onboarding.serviceSetup.map((service) => (
                        <div key={service.orderItemId}>
                          <p className="text-sm font-medium mb-2">
                            {service.serviceName} ({service.doneCount}/{service.total})
                          </p>
                          <ul className="space-y-1.5">
                            {service.items.map((item) => (
                              <li
                                key={item.id}
                                className="flex items-start gap-2 text-sm"
                              >
                                {item.ok ? (
                                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 mt-0.5" />
                                ) : (
                                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                                )}
                                <span>
                                  <span className="font-medium">{item.title}</span>
                                  {!item.ok ? (
                                    <span className="text-muted-foreground">
                                      {" "}
                                      - {item.description}
                                    </span>
                                  ) : null}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : orderDetails && !isLoadingOrderDetails ? (
                <div>
                  <h3 className="font-semibold mb-2">Онбординг</h3>
                  <p className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-4">
                    Тази поръчка няма услуги, изискващи онбординг.
                  </p>
                </div>
              ) : null}

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Услуги</h3>
                <div className="space-y-3">
                  {selectedOrder.cart.items.map((item) => {
                    const service = getServiceById(item.serviceId);
                    return (
                      <div
                        key={item.id}
                        className="bg-secondary/50 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{item.serviceName}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.selectedOptionName}
                            </p>
                          </div>
                          <span className="font-semibold">
                            <Price value={item.totalPrice} />
                            {item.isMonthly && "/мес"}
                          </span>
                        </div>
                        {item.upsells.length > 0 && service && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-sm font-medium mb-2">
                              Допълнителни услуги:
                            </p>
                            <ul className="space-y-1">
                              {item.upsells.map((upsell) => {
                                const serviceUpsell = service.upsells.find(
                                  (u) => u.id === upsell.upsellId
                                );
                                if (!serviceUpsell) return null;
                                return (
                                  <li
                                    key={upsell.upsellId}
                                    className="text-sm text-muted-foreground"
                                  >
                                    {serviceUpsell.name} x{upsell.quantity} (+
                                    <Price value={(serviceUpsell.pricePerUnit ?? 0) * upsell.quantity} />)
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedOrder.brandAssets?.logoUrl || selectedOrder.brandAssets?.paletteUrl ? (
                <div>
                  <h3 className="font-semibold mb-2">Бранд материали</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedOrder.brandAssets?.logoUrl ? (
                      <a
                        href={selectedOrder.brandAssets.logoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-border bg-secondary/30 p-3"
                      >
                        <p className="mb-2 text-sm font-medium">Лого</p>
                        <Image
                          src={`/api/uploads/brand/view?url=${encodeURIComponent(selectedOrder.brandAssets.logoUrl)}`}
                          alt="Лого"
                          width={640}
                          height={320}
                          className="h-40 w-full rounded-md border border-border bg-background object-contain p-2"
                        />
                      </a>
                    ) : null}
                    {selectedOrder.brandAssets?.paletteUrl ? (
                      <a
                        href={selectedOrder.brandAssets.paletteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-border bg-secondary/30 p-3"
                      >
                        <p className="mb-2 text-sm font-medium">Цветова палитра</p>
                        <Image
                          src={`/api/uploads/brand/view?url=${encodeURIComponent(selectedOrder.brandAssets.paletteUrl)}`}
                          alt="Цветова палитра"
                          width={640}
                          height={320}
                          className="h-40 w-full rounded-md border border-border bg-background object-contain p-2"
                        />
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Status & Total */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">Статус:</span>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) =>
                      handleStatusChange(
                        selectedOrder.id,
                        value as Order["status"]
                      )
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground text-sm">
                    Обща сума
                  </span>
                  <Price
                    value={
                      selectedOrder.cart.totalOneTime +
                      selectedOrder.cart.totalMonthly
                    }
                    className="text-2xl gradient-text"
                  />
                </div>
              </div>

              {selectedOrder.consultation ? (
                <div>
                  <h3 className="font-semibold mb-2">Консултация</h3>
                  <div className="bg-secondary/50 rounded-lg p-4 space-y-1">
                    <p>
                      <span className="text-muted-foreground">Дата:</span>{" "}
                      {selectedOrder.consultation.date}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Час:</span>{" "}
                      {selectedOrder.consultation.time}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Източник:</span>{" "}
                      {selectedOrder.consultation.source}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
