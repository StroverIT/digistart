"use client";

import type {
  Order,
  Cart,
  CustomerInfo,
  DailyStats,
  ServiceStats,
  ConsultationBooking,
} from "@/lib/types";
import { getDailyPageViewCounts } from "@/lib/store/site-analytics";

const ORDERS_STORAGE_KEY = "digistart-orders";

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

export function createOrder(
  cart: Cart,
  customer: CustomerInfo,
  consultation?: ConsultationBooking
): Order {
  const orders = getOrders();

  const order: Order = {
    id: `ORD-${Date.now().toString(36).toUpperCase()}`,
    cart,
    customer,
    consultation,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.unshift(order);
  saveOrders(orders);

  return order;
}

export function updateOrderStatus(orderId: string, status: Order["status"]): Order | null {
  const orders = getOrders();
  const orderIndex = orders.findIndex((o) => o.id === orderId);

  if (orderIndex === -1) return null;

  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();
  saveOrders(orders);

  return orders[orderIndex];
}

export function getOrderById(orderId: string): Order | null {
  const orders = getOrders();
  return orders.find((o) => o.id === orderId) || null;
}

export function getDailyStats(days: number = 30): DailyStats[] {
  const orders = getOrders();
  const stats: Map<string, DailyStats> = new Map();
  const pageViewsByDay = getDailyPageViewCounts(days);

  // Generate dates for the last N days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const visits = pageViewsByDay.get(dateStr) ?? 0;
    stats.set(dateStr, { date: dateStr, visits, orders: 0, revenue: 0 });
  }

  // Add order data
  for (const order of orders) {
    const dateStr = order.createdAt.split("T")[0];
    const stat = stats.get(dateStr);
    if (stat) {
      stat.orders++;
      stat.revenue += order.cart.totalOneTime + order.cart.totalMonthly;
    }
  }

  return Array.from(stats.values());
}

export function getServiceStats(): ServiceStats[] {
  const orders = getOrders();
  const stats: Map<string, ServiceStats> = new Map();

  for (const order of orders) {
    for (const item of order.cart.items) {
      const existing = stats.get(item.serviceId) || {
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        orderCount: 0,
        revenue: 0,
      };
      existing.orderCount++;
      existing.revenue += item.totalPrice;
      stats.set(item.serviceId, existing);
    }
  }

  return Array.from(stats.values()).sort((a, b) => b.revenue - a.revenue);
}

// Seed some demo orders for the admin panel
export function seedDemoOrders(): void {
  const existingOrders = getOrders();
  if (existingOrders.length > 0) return;

  const demoOrders: Order[] = [
    {
      id: "ORD-ABC123",
      cart: {
        items: [
          {
            id: "demo-1",
            serviceId: "google-business",
            serviceName: "Google Business",
            selectedOptionId: "basic",
            selectedOptionName: "Профил в Google Business",
            basePrice: 50,
            upsells: [],
            totalPrice: 50,
            totalOneTime: 50,
            totalMonthly: 0,
            isMonthly: false,
          },
        ],
        totalOneTime: 50,
        totalMonthly: 0,
      },
      customer: {
        name: "Иван Петров",
        email: "ivan@example.com",
        phone: "+359 888 123 456",
        company: "Петров ЕООД",
      },
      status: "completed",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "ORD-DEF456",
      cart: {
        items: [
          {
            id: "demo-2",
            serviceId: "ready-store",
            serviceName: "Онлайн Магазин",
            selectedOptionId: "subscription",
            selectedOptionName: "Онлайн Магазин",
            basePrice: 499,
            upsells: [{ upsellId: "sales-booster", quantity: 1 }],
            totalPrice: 584,
            totalOneTime: 584,
            totalMonthly: 0,
            isMonthly: false,
          },
        ],
        totalOneTime: 584,
        totalMonthly: 0,
      },
      customer: {
        name: "Мария Георгиева",
        email: "maria@example.com",
        phone: "+359 899 987 654",
        company: "Fashion BG",
      },
      status: "in_progress",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "ORD-GHI789",
      cart: {
        items: [
          {
            id: "demo-3",
            serviceId: "social-media",
            serviceName: "Социални мрежи",
            selectedOptionId: "default",
            selectedOptionName: "Базов маркетинг пакет",
            basePrice: 900,
            upsells: [],
            totalPrice: 900,
            totalOneTime: 0,
            totalMonthly: 900,
            isMonthly: true,
          },
        ],
        totalOneTime: 0,
        totalMonthly: 900,
      },
      customer: {
        name: "Георги Димитров",
        email: "georgi@example.com",
        phone: "+359 877 456 789",
      },
      status: "pending",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  saveOrders(demoOrders);
}
