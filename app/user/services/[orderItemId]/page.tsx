import { notFound } from "next/navigation";
import Image from "next/image";
import { getServerSession } from "next-auth";
import {
  CalendarClock,
  CheckCircle2,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  Sparkles,
  Wallet,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripeServerClient } from "@/lib/server/stripe";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { getServiceById } from "@/lib/data/services";
import { calculateItemTotal } from "@/lib/pricing/calculate-item-total";
import type { CartItemUpsell } from "@/lib/types";
import { DomainSetupCard } from "@/components/user/domain-setup-card";
import { ServiceSetupGuide } from "@/components/user/service-setup-guide";
import { ONBOARDING_SERVICE_IDS } from "@/lib/onboarding/requirements";
import {
  buildServiceSetupProgress,
  getRequirementsForOrderItem,
} from "@/lib/onboarding/service-setup-status";
import { getStoreDomainByOrderItemId } from "@/lib/server/store-domains";
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

function daysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
}

function formatDaysUntilLabel(days: number): string {
  if (days === 0) return "Днес";
  if (days === 1) return "Утре";
  return `След ${days} дни`;
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
    include: { order: { include: { items: true } } },
  });

  if (!item) notFound();

  const upsells = parseOrderItemUpsells(item.upsells);
  /** Static catalog in `lib/data/services.ts` - preferred for titles and copy. */
  const catalogService = getServiceById(item.serviceId);
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

  let storeDomain = null;
  if (isOnlineStore) {
    try {
      storeDomain = await getStoreDomainByOrderItemId(item.id);
    } catch {
      storeDomain = null;
    }
  }

  const isOnboardingService = (ONBOARDING_SERVICE_IDS as readonly string[]).includes(
    item.serviceId,
  );

  const setupProgress = isOnboardingService
    ? buildServiceSetupProgress({
      serviceId: item.serviceId,
      orderItemId: item.id,
      project: tenantProject,
      requirements: getRequirementsForOrderItem(
        item.order.items.map((row) => ({
          serviceId: row.serviceId,
          upsells: row.upsells,
        })),
        item.serviceId,
      ),
      hasLogo: Boolean(logoUrl),
      hasPalette: Boolean(paletteUrl),
      domain: storeDomain,
    })
    : null;

  return (
    <div className="@container mx-auto max-w-5xl space-y-6">
      {setupProgress?.incomplete ? (
        <ServiceSetupGuide
          orderItemId={item.id}
          serviceName={item.serviceName}
          items={setupProgress.items}
        />
      ) : null}

      <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <PackageCheck className="h-3.5 w-3.5" />
              Активна услуга
            </div>
            <h1 className="text-2xl font-bold md:text-3xl">{item.serviceName}</h1>
            <p className="mt-2 text-muted-foreground">{item.selectedOptionName}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-secondary/50 p-4 text-left lg:min-w-60 lg:text-right">
            {displayMonthly > 0 ? (
              <>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Стартова такса</p>
                <Price
                  value={item.totalOneTime}
                  layout="vertical"
                  className="mt-1 text-2xl font-bold text-primary lg:items-end"
                />
                <p className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground lg:justify-end">
                  <span>+</span>
                  <Price value={displayMonthly} layout="vertical" className="text-sm font-medium text-foreground" />
                  <span>/мес</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Еднократна цена</p>
                <Price
                  value={item.totalOneTime}
                  layout="vertical"
                  className="mt-1 text-2xl font-bold text-primary lg:items-end"
                />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
        <Card className="h-full border-border bg-card/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ReceiptText className="h-4 w-4 text-primary" />
              Разбивка на цената
            </CardTitle>
            <CardDescription>Какво плащате за тази услуга</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-secondary/40 px-4 py-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">Еднократно</p>
                  <p className="text-xs text-muted-foreground">Стартова такса при активиране</p>
                </div>
              </div>
              <Price
                value={item.totalOneTime}
                layout="responsive"
                className="shrink-0 text-right text-sm"
              />
            </div>

            {displayMonthly > 0 ? (
              <div className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-secondary/40 px-4 py-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
                    <RefreshCw className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Месечно</p>
                    <p className="text-xs text-muted-foreground">Автоматично подновяване всеки месец</p>
                  </div>
                </div>
                <span className="shrink-0 text-right text-sm">
                  <Price value={displayMonthly} layout="responsive" className="justify-end" />
                  <span className="mt-0.5 block text-xs text-muted-foreground">/мес</span>
                </span>
              </div>
            ) : null}


          </CardContent>
        </Card>

        {hasRecurringSubscription ? (
          <Card className="h-full border-border bg-card/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CalendarClock className="h-4 w-4 text-primary" />
                    Абонамент
                  </CardTitle>
                  <CardDescription className="mt-1.5">Месечно автоматично подновяване</CardDescription>
                </div>
                <Badge variant="secondary" className="shrink-0 gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Активен
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {renew ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex h-18 w-18 shrink-0 flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">
                      <span className="text-2xl font-bold leading-none tabular-nums text-primary">
                        {renew.getDate()}
                      </span>
                      <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {renew.toLocaleDateString("bg-BG", { month: "short" }).replace(".", "")}
                      </span>
                      <span className="text-[10px] tabular-nums text-muted-foreground">{renew.getFullYear()}</span>
                    </div>
                    <div className="min-w-0 space-y-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Следващо подновяване
                        </p>
                        <p className="mt-0.5 font-semibold capitalize leading-snug">
                          {renew.toLocaleDateString("bg-BG", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <Badge variant="outline" className="font-normal">
                        {formatDaysUntilLabel(daysUntil(renew))}
                      </Badge>
                    </div>
                  </div>

                  {displayMonthly > 0 ? (
                    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/40 px-4 py-3 text-sm">
                      <span className="text-muted-foreground">Сума при подновяване</span>
                      <span className="font-medium">
                        <Price value={displayMonthly} layout="responsive" className="justify-end" />
                        <span className="text-xs font-normal text-muted-foreground"> /мес</span>
                      </span>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-secondary/30 px-4 py-5 text-center">
                  <RefreshCw className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">Абонаментът е активен</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Датата за следващо подновяване ще се появи след синхронизация със Stripe.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full border-border bg-card/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="h-4 w-4 text-primary" />
                Тип плащане
              </CardTitle>
              <CardDescription>Без месечен абонамент</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-secondary/40 px-4 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Еднократно закупена услуга</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Няма автоматично подновяване или периодични такси след първоначалното плащане.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {isOnlineStore ? (
        <div id="store-domain-setup" className="scroll-mt-20 md:scroll-mt-24">
          <DomainSetupCard orderItemId={item.id} vpsIp={vpsIp} />
        </div>
      ) : null}

      {(logoUrl || paletteUrl) ? (
        <Card
          id={isOnlineStore ? "store-brand-assets" : undefined}
          className="border-border bg-card/80 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both"
        >
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
                const choiceDef =
                  catalogCfg?.kind === "choice" && u.choiceId
                    ? catalogCfg.choices?.find((c) => c.id === u.choiceId)
                    : undefined;
                const title = catalogCfg?.name ?? humanizeUpsellId(u.upsellId);
                const description = catalogCfg?.description;
                const isMonthly = catalogCfg?.isMonthly ?? false;
                const missingInCatalog = !catalogCfg;
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
