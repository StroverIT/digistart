import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAdminStripeTestOrderInDb } from "@/lib/server/admin-stripe-test-order";
import { setOrderStripeSessionInDb } from "@/lib/server/orders";
import { getStripeServerClient } from "@/lib/server/stripe";
import { resolveOrCreateStripeCustomer } from "@/lib/server/stripe-catalog";

const TEST_UNIT_AMOUNT_CENTS = 50;

function extractStripeId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" ? id : null;
  }
  return null;
}

function getSiteUrl(req: NextRequest) {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envSiteUrl) return envSiteUrl.replace(/\/$/, "");

  const origin = req.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");

  return "http://localhost:3000";
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const email = session.user.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Admin session has no email." }, { status: 400 });
    }

    const name = session.user.name?.trim() || "Администратор";
    const userId =
      session.user.id && session.user.id !== "admin-env" ? session.user.id : null;

    const orderRow = await createAdminStripeTestOrderInDb({
      customerName: name,
      customerEmail: email,
      customerPhone: "0000000000",
      userId,
    });

    const stripe = getStripeServerClient();
    const siteUrl = getSiteUrl(req);
    const stripeCustomer = await resolveOrCreateStripeCustomer({
      email: orderRow.customerEmail,
      name: orderRow.customerName,
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: stripeCustomer.stripeCustomerId,
      locale: "bg",
      billing_address_collection: "auto",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: TEST_UNIT_AMOUNT_CENTS,
            product_data: {
              name: "DigiStart - админ тест на плащане",
              description: "Еднократно тестово плащане €0.50 (production).",
            },
          },
        },
      ],
      metadata: {
        orderId: orderRow.id,
        adminStripeTest: "true",
      },
      success_url: `${siteUrl}/checkout/success?id=${orderRow.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/admin/testing`,
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Stripe session has no redirect URL." },
        { status: 500 }
      );
    }

    const paymentIntentId = extractStripeId(checkoutSession.payment_intent);

    await setOrderStripeSessionInDb({
      orderId: orderRow.id,
      checkoutSessionId: checkoutSession.id,
      checkoutMode: "payment",
      paymentIntentId,
      customerId: stripeCustomer.stripeCustomerId,
      paymentStatus: checkoutSession.payment_status ?? null,
      metadata: {
        orderId: orderRow.id,
        adminStripeTest: "true",
      },
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      orderId: orderRow.id,
      amountEur: 0.5,
    });
  } catch (error) {
    console.error("Admin checkout test error", error);
    return NextResponse.json(
      { error: "Failed to start test checkout." },
      { status: 500 }
    );
  }
}
