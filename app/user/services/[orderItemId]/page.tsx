import { notFound } from "next/navigation";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { CalendarClock, PackageCheck, ReceiptText, Sparkles } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripeServerClient } from "@/lib/server/stripe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { getServiceById } from "@/lib/data/services";
import { calculateItemTotal } from "@/lib/pricing/calculate-item-total";
import type { CartItemUpsell } from "@/lib/types";

export default async function UserServiceDetailPage({
  params,
}: {
  params: Promise<{ orderItemId: string }>;
}) {
  const { orderItemId } = await params;
  const runId = `service-detail-${orderItemId}-${Date.now()}`;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) notFound();

  const item = await prisma.orderItem.findFirst({
    where: {
      id: orderItemId,
      order: { userId: session.user.id },
    },
    include: { order: true },
  });

  if (!item) notFound();

  const upsells = (item.upsells as unknown as CartItemUpsell[]) ?? [];
  const service = getServiceById(item.serviceId);
  const storedMonthly = Number(item.totalMonthly) || 0;
  const derivedTotals = calculateItemTotal(item.serviceId, item.selectedOptionId, upsells);
  const displayMonthly =
    storedMonthly > 0 ? storedMonthly : derivedTotals.monthlyTotal;
  let renew = item.order.subscriptionRenewsAt;

  // #region agent log
  fetch("http://127.0.0.1:7562/ingest/27ce1d6c-483c-43a1-aa36-7afa28771441", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "5ed625" },
    body: JSON.stringify({
      sessionId: "5ed625",
      runId,
      hypothesisId: "H1",
      location: "app/user/services/[orderItemId]/page.tsx:39",
      message: "Initial subscription state before fallback sync",
      data: {
        orderItemId,
        orderId: item.order.id,
        hasStripeSubscriptionId: Boolean(item.order.stripeSubscriptionId),
        stripeSubscriptionId: item.order.stripeSubscriptionId ?? null,
        subscriptionRenewsAt: renew?.toISOString() ?? null,
        displayMonthly,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (!renew && item.order.stripeSubscriptionId) {
    // #region agent log
    fetch("http://127.0.0.1:7562/ingest/27ce1d6c-483c-43a1-aa36-7afa28771441", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "5ed625" },
      body: JSON.stringify({
        sessionId: "5ed625",
        runId,
        hypothesisId: "H2",
        location: "app/user/services/[orderItemId]/page.tsx:42",
        message: "Entering Stripe renewal fallback branch",
        data: {
          orderId: item.order.id,
          stripeSubscriptionId: item.order.stripeSubscriptionId,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    try {
      const stripe = getStripeServerClient();
      const subscription = await stripe.subscriptions.retrieve(item.order.stripeSubscriptionId);
      const rawSubscription = subscription as {
        current_period_end?: number | null;
        items?: { data?: Array<{ current_period_end?: number | null }> };
        billing_cycle_anchor?: number | null;
      };
      const itemPeriodEnd = rawSubscription.items?.data?.[0]?.current_period_end ?? null;
      const cpe =
        rawSubscription.current_period_end ?? itemPeriodEnd ?? rawSubscription.billing_cycle_anchor;

      // #region agent log
      fetch("http://127.0.0.1:7562/ingest/27ce1d6c-483c-43a1-aa36-7afa28771441", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "5ed625" },
        body: JSON.stringify({
          sessionId: "5ed625",
          runId,
          hypothesisId: "H3",
          location: "app/user/services/[orderItemId]/page.tsx:67",
          message: "Stripe subscription response for renewal",
          data: {
            orderId: item.order.id,
            stripeSubscriptionId: item.order.stripeSubscriptionId,
            hasCurrentPeriodEnd: Boolean(cpe),
            currentPeriodEndUnix: cpe ?? null,
            stripeStatus: "status" in subscription ? subscription.status : null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      // #region agent log
      fetch("http://127.0.0.1:7562/ingest/27ce1d6c-483c-43a1-aa36-7afa28771441", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "5ed625" },
        body: JSON.stringify({
          sessionId: "5ed625",
          runId,
          hypothesisId: "H6",
          location: "app/user/services/[orderItemId]/page.tsx:85",
          message: "Subscription renewal candidates by field",
          data: {
            orderId: item.order.id,
            stripeSubscriptionId: item.order.stripeSubscriptionId,
            rootCurrentPeriodEndUnix: rawSubscription.current_period_end ?? null,
            itemCurrentPeriodEndUnix: itemPeriodEnd,
            billingCycleAnchorUnix: rawSubscription.billing_cycle_anchor ?? null,
            chosenRenewalUnix: cpe ?? null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      if (cpe) {
        renew = new Date(cpe * 1000);
        await prisma.order.update({
          where: { id: item.order.id },
          data: { subscriptionRenewsAt: renew },
        });

        // #region agent log
        fetch("http://127.0.0.1:7562/ingest/27ce1d6c-483c-43a1-aa36-7afa28771441", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "5ed625" },
          body: JSON.stringify({
            sessionId: "5ed625",
            runId,
            hypothesisId: "H4",
            location: "app/user/services/[orderItemId]/page.tsx:86",
            message: "Persisted renewal date from Stripe into order",
            data: {
              orderId: item.order.id,
              persistedRenewalIso: renew.toISOString(),
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
      }
    } catch (error) {
      // #region agent log
      fetch("http://127.0.0.1:7562/ingest/27ce1d6c-483c-43a1-aa36-7afa28771441", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "5ed625" },
        body: JSON.stringify({
          sessionId: "5ed625",
          runId,
          hypothesisId: "H5",
          location: "app/user/services/[orderItemId]/page.tsx:102",
          message: "Stripe renewal fallback failed",
          data: {
            orderId: item.order.id,
            stripeSubscriptionId: item.order.stripeSubscriptionId ?? null,
            errorMessage: error instanceof Error ? error.message : "unknown",
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      console.error("Failed to sync subscription renewal date", error);
    }
  }

  const hasRecurringSubscription =
    Boolean(item.order.stripeSubscriptionId) || displayMonthly > 0 || Boolean(renew);

  // #region agent log
  fetch("http://127.0.0.1:7562/ingest/27ce1d6c-483c-43a1-aa36-7afa28771441", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "5ed625" },
    body: JSON.stringify({
      sessionId: "5ed625",
      runId,
      hypothesisId: "H1",
      location: "app/user/services/[orderItemId]/page.tsx:118",
      message: "Final subscription state used by UI",
      data: {
        orderId: item.order.id,
        hasRecurringSubscription,
        finalRenewalIso: renew?.toISOString() ?? null,
        branch: renew ? "renew-date" : hasRecurringSubscription ? "sync-pending-message" : "one-time",
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  const brandAssets = (item.order.brandAssets as { logoUrl?: string | null; paletteUrl?: string | null } | null) ?? null;
  const logoUrl = brandAssets?.logoUrl ?? null;
  const paletteUrl = brandAssets?.paletteUrl ?? null;
  const logoPreviewUrl = logoUrl ? `/api/uploads/brand/view?url=${encodeURIComponent(logoUrl)}` : null;
  const palettePreviewUrl = paletteUrl ? `/api/uploads/brand/view?url=${encodeURIComponent(paletteUrl)}` : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <PackageCheck className="h-3.5 w-3.5" />
              Активна услуга
            </div>
            <h1 className="text-2xl font-bold md:text-3xl">{item.serviceName}</h1>
            <p className="mt-2 text-muted-foreground">{item.selectedOptionName}</p>
          </div>
          <div className="rounded-2xl bg-secondary/70 p-4 text-left md:min-w-56 md:text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Общо позиция</p>
            <Price value={item.totalPrice} className="mt-1 text-2xl font-bold text-primary" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-border bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ReceiptText className="h-5 w-5 text-primary" />
            Цена
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Еднократно</span>
            <Price value={item.totalOneTime} className="font-medium" />
          </div>
          {displayMonthly > 0 ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Месечно</span>
              <span>
                <Price value={displayMonthly} className="font-medium" /> /мес
              </span>
            </div>
          ) : null}
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Общо позиция</span>
            <Price value={item.totalPrice} />
          </div>
        </CardContent>
      </Card>

      {hasRecurringSubscription ? (
        <Card className="border-border bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarClock className="h-5 w-5 text-primary" />
              Абонамент
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renew ? (
              <>
                <p className="text-sm text-muted-foreground">Следващо подновяване</p>
                <p className="text-lg font-semibold">
                  {renew.toLocaleDateString("bg-BG", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Абонаментът е активен</p>
                <p className="text-base font-semibold">Очаква се синхронизация на датата за подновяване</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarClock className="h-5 w-5 text-primary" />
              Тип плащане
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Еднократно закупена услуга</p>
            <p className="mt-1 font-semibold">Без автоматично подновяване</p>
          </CardContent>
        </Card>
      )}
      </div>

      {(logoUrl || paletteUrl) ? (
        <Card className="border-border bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Качени бранд материали</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {logoUrl ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Лого</p>
                <a href={logoUrl} target="_blank" rel="noreferrer">
                  <Image
                    src={logoPreviewUrl ?? logoUrl}
                    alt="Качено лого"
                    width={640}
                    height={320}
                    className="h-40 w-full rounded-xl border border-border object-contain bg-background p-2"
                  />
                </a>
              </div>
            ) : null}
            {paletteUrl ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Цветова палитра</p>
                <a href={paletteUrl} target="_blank" rel="noreferrer">
                  <Image
                    src={palettePreviewUrl ?? paletteUrl}
                    alt="Качена цветова палитра"
                    width={640}
                    height={320}
                    className="h-40 w-full rounded-xl border border-border object-contain bg-background p-2"
                  />
                </a>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Закупени добавки
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upsells.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
              Няма допълнителни модули към тази услуга.
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {upsells.map((u) => {
                const cfg = service?.upsells.find((x) => x.id === u.upsellId);
                if (!cfg || u.quantity <= 0) return null;
                const choice =
                  cfg.kind === "choice" && u.choiceId
                    ? cfg.choices?.find((c) => c.id === u.choiceId)?.name
                    : null;
                return (
                  <li
                    key={u.upsellId}
                    className="rounded-2xl border border-border bg-secondary/40 p-4 text-sm"
                  >
                    <p className="font-medium">{cfg.name}</p>
                    {choice ? <p className="mt-1 text-muted-foreground">{choice}</p> : null}
                    {u.quantity > 1 ? (
                      <p className="mt-2 text-xs text-muted-foreground">Количество: {u.quantity}</p>
                    ) : null}
                    {cfg.isMonthly ? (
                      <p className="mt-2 text-xs text-muted-foreground">Месечно таксуване</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
