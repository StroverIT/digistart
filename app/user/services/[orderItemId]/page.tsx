import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowRight, CalendarClock, PackageCheck, ReceiptText, Sparkles } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripeServerClient } from "@/lib/server/stripe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { getServiceById } from "@/lib/data/services";
import { calculateItemTotal } from "@/lib/pricing/calculate-item-total";
import { getServiceByIdFromDb } from "@/lib/server/services";
import type { CartItemUpsell } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { DomainSetupCard } from "@/components/user/domain-setup-card";
import { isOnboardingIncomplete } from "@/lib/onboarding/is-onboarding-incomplete";
import {
  getOnboardingBannerCopy,
  ONBOARDING_SERVICE_IDS,
} from "@/lib/onboarding/requirements";
import { getTenantProjectForUser } from "@/lib/server/tenant-projects";
import { getStoreVpsIp, ONLINE_STORE_SERVICE_ID } from "@/lib/store-dns";

/** Last-resort label when no catalog/DB name exists (kebab-case → words). */
function humanizeUpsellId(id: string): string {
  return id
    .split(/[-_]/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function parseOrderItemUpsells(raw: unknown): CartItemUpsell[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (entry): entry is CartItemUpsell =>
      typeof entry === "object" &&
      entry !== null &&
      typeof (entry as CartItemUpsell).upsellId === "string" &&
      typeof (entry as CartItemUpsell).quantity === "number"
  );
}

export default async function UserServiceDetailPage({
  params,
}: {
  params: Promise<{ orderItemId: string }>;
}) {
  const { orderItemId } = await params;
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

  const upsells = parseOrderItemUpsells(item.upsells);
  /** Static catalog in `lib/data/services.ts` - preferred for titles and copy. */
  const catalogService = getServiceById(item.serviceId);
  const dbService = await getServiceByIdFromDb(item.serviceId);
  const storedMonthly = Number(item.totalMonthly) || 0;
  const derivedTotals = calculateItemTotal(item.serviceId, item.selectedOptionId, upsells);
  const displayMonthly =
    storedMonthly > 0 ? storedMonthly : derivedTotals.monthlyTotal;
  let renew = item.order.subscriptionRenewsAt;

  if (!renew && item.order.stripeSubscriptionId) {
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

      if (cpe) {
        renew = new Date(cpe * 1000);
        await prisma.order.update({
          where: { id: item.order.id },
          data: { subscriptionRenewsAt: renew },
        });
      }
    } catch (error) {
      console.error("Failed to sync subscription renewal date", error);
    }
  }

  const hasRecurringSubscription =
    Boolean(item.order.stripeSubscriptionId) || displayMonthly > 0 || Boolean(renew);
  const brandAssets = (item.order.brandAssets as { logoUrl?: string | null; paletteUrl?: string | null } | null) ?? null;
  const logoUrl = brandAssets?.logoUrl ?? null;
  const paletteUrl = brandAssets?.paletteUrl ?? null;
  const logoPreviewUrl = logoUrl ? `/api/uploads/brand/view?url=${encodeURIComponent(logoUrl)}` : null;
  const palettePreviewUrl = paletteUrl ? `/api/uploads/brand/view?url=${encodeURIComponent(paletteUrl)}` : null;
  const isOnlineStore = item.serviceId === ONLINE_STORE_SERVICE_ID;
  const vpsIp = getStoreVpsIp();
  const tenantProject = await getTenantProjectForUser(session.user.id);
  const showOnboardingBanner =
    isOnboardingIncomplete(tenantProject) &&
    (ONBOARDING_SERVICE_IDS as readonly string[]).includes(item.serviceId);
  const onboardingCopy = showOnboardingBanner
    ? getOnboardingBannerCopy(item.serviceId)
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {showOnboardingBanner && onboardingCopy ? (
        <Card className="border-primary/40 bg-primary/5 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">{onboardingCopy.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{onboardingCopy.description}</p>
            </div>
            <Button asChild>
              <Link href={`/onboarding?orderItemId=${item.id}`}>
                Продължи настройката
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
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

      <div className="grid gap-4 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
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

      {isOnlineStore ? <DomainSetupCard orderItemId={item.id} vpsIp={vpsIp} /> : null}

      {(logoUrl || paletteUrl) ? (
        <Card className="border-border bg-card/80 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
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

      <Card className="border-border bg-card/80 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
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
                if (u.quantity <= 0) return null;
                const catalogCfg = catalogService?.upsells.find((x) => x.id === u.upsellId);
                const dbCfg = dbService?.upsells.find((x) => x.id === u.upsellId);
                const cfg = catalogCfg ?? dbCfg;
                const choiceParent = catalogCfg ?? dbCfg;
                const choiceDef =
                  choiceParent?.kind === "choice" && u.choiceId
                    ? choiceParent.choices?.find((c) => c.id === u.choiceId)
                    : undefined;
                const title =
                  catalogCfg?.name ?? dbCfg?.name ?? humanizeUpsellId(u.upsellId);
                const description = catalogCfg?.description ?? dbCfg?.description;
                const isMonthly = catalogCfg?.isMonthly ?? dbCfg?.isMonthly ?? false;
                const missingInCatalog = !catalogCfg && !dbCfg;
                return (
                  <li
                    key={u.upsellId}
                    className="rounded-2xl border border-border bg-secondary/40 p-4 text-sm"
                  >
                    <p className="font-medium">{title}</p>
                    {description ? (
                      <p className="mt-2 text-muted-foreground leading-relaxed">{description}</p>
                    ) : null}
                    {missingInCatalog ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Няма пълно описание за тази добавка в каталога.
                      </p>
                    ) : null}
                    {choiceDef ? (
                      <div className="mt-3 rounded-xl border border-border/80 bg-background/50 px-3 py-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Избор
                        </p>
                        <p className="mt-0.5 font-medium">{choiceDef.name}</p>
                        {choiceDef.description ? (
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                            {choiceDef.description}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    {u.quantity > 1 ? (
                      <p className="mt-2 text-xs text-muted-foreground">Количество: {u.quantity}</p>
                    ) : null}
                    {isMonthly ? (
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
