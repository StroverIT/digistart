import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { PreviewLink } from "@/components/preview/preview-link";
import { isOnboardingIncomplete } from "@/lib/onboarding/is-onboarding-incomplete";
import { getTenantProjectForUser } from "@/lib/server/tenant-projects";

export default async function UserHomePage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user!.id;

  const orders = await prisma.order.findMany({
    where: { userId, status: { in: ["paid", "in_progress", "completed"] } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const itemCount = orders.reduce((acc, o) => acc + o.items.length, 0);
  const totalOneTime = orders.reduce((acc, o) => acc + o.totalOneTime, 0);

  const renewDates = orders
    .map((o) => o.subscriptionRenewsAt)
    .filter((d): d is Date => d != null)
    .sort((a, b) => a.getTime() - b.getTime());
  const nextRenewal = renewDates[0] ?? null;
  const nextRenewalServices = nextRenewal
    ? Array.from(
      new Set(
        orders
          .filter(
            (o) =>
              o.subscriptionRenewsAt &&
              o.subscriptionRenewsAt.getTime() === nextRenewal.getTime()
          )
          .flatMap((o) => o.items.map((item) => item.serviceName))
      )
    )
    : [];

  const tenantProject = await getTenantProjectForUser(userId);
  const onboardingIncomplete = isOnboardingIncomplete(tenantProject);

  return (
    <div className="space-y-8">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
        <h1 className="text-2xl font-bold">Моят панел</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Здравей{session?.user?.name ? `, ${session.user.name}` : ""}!
        </p>
      </div>

      {(onboardingIncomplete || tenantProject?.previewPath) && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Онлайн магазин</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            {onboardingIncomplete && (
              <Button asChild>
                <Link href="/onboarding">Продължи настройката</Link>
              </Button>
            )}
            {tenantProject?.previewPath && (
              <PreviewLink
                href={tenantProject.previewPath}
                ctaId="user_panel_store_preview"
                ctaPage="/user"
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent"
              >
                Преглед на сайта
              </PreviewLink>
            )}
            {tenantProject && (
              <span className="text-sm text-muted-foreground capitalize">
                Статус: {tenantProject.setupStatus}
              </span>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Закупени услуги
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{itemCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Общо еднократно (платени поръчки)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              <Price value={totalOneTime} layout="vertical" />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Следващо подновяване
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {nextRenewal
                ? nextRenewal.toLocaleDateString("bg-BG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
                : "-"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {nextRenewalServices.length > 0
                ? `Услуга: ${nextRenewalServices.join(", ")}`
                : "Няма активни абонаменти"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
