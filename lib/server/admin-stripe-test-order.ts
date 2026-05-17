import { prisma } from "@/lib/prisma";

/** Internal catalog row for admin-only Stripe smoke tests; excluded from public `getServices()`. */
export const ADMIN_STRIPE_TEST_SERVICE_ID = "admin-stripe-test";

const ADMIN_TEST_OPTION_KEY = "eur-050-test";

export async function ensureAdminStripeTestServiceInDb() {
  const existing = await prisma.service.findUnique({
    where: { id: ADMIN_STRIPE_TEST_SERVICE_ID },
    select: { id: true },
  });
  if (existing) return;

  await prisma.service.create({
    data: {
      id: ADMIN_STRIPE_TEST_SERVICE_ID,
      slug: "admin-stripe-test",
      name: "ADMIN Stripe тест",
      shortDescription: "Вътрешна тестова позиция за проверка на плащане.",
      fullDescription:
        "Не се показва в каталога. Използва се само от админ страницата за тестване на Stripe в production.",
      icon: "Zap",
      basePrice: 0,
      isMonthly: false,
      timeline: "-",
      features: [],
      options: {
        create: {
          optionKey: ADMIN_TEST_OPTION_KEY,
          name: "Тестово плащане €0.50",
          description: "Еднократно тестово плащане през Stripe Checkout.",
          price: 0,
          isMonthly: false,
        },
      },
    },
  });
}

export async function createAdminStripeTestOrderInDb(params: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  userId?: string | null;
}) {
  await ensureAdminStripeTestServiceInDb();

  return prisma.order.create({
    data: {
      userId: params.userId ?? undefined,
      customerName: params.customerName,
      customerEmail: params.customerEmail.trim().toLowerCase(),
      customerPhone: params.customerPhone,
      customerNotes: "ADMIN_CHECKOUT_TEST: Stripe Checkout €0.50 (production smoke test).",
      totalOneTime: 0,
      totalMonthly: 0,
      status: "pending",
      items: {
        create: {
          serviceId: ADMIN_STRIPE_TEST_SERVICE_ID,
          serviceName: "ADMIN Stripe тест",
          selectedOptionId: ADMIN_TEST_OPTION_KEY,
          selectedOptionName: "Тестово плащане €0.50",
          basePrice: 0,
          totalPrice: 0,
          totalOneTime: 0,
          totalMonthly: 0,
          isMonthly: false,
          upsells: [],
        },
      },
    },
    include: {
      items: true,
      consultation: true,
    },
  });
}
