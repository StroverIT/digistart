import Link from "next/link";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OnlineStoreSetupItem } from "@/lib/onboarding/online-store-setup-status";
import { hasIncompleteOnlineStoreSetup } from "@/lib/onboarding/online-store-setup-status";
import { siteContact } from "@/lib/site-contact";

type OnlineStoreSetupStatusCardProps = {
  orderItemId: string;
  items: OnlineStoreSetupItem[];
};

function rowActionLink(item: OnlineStoreSetupItem, orderItemId: string): string | null {
  if (item.ok) return null;
  switch (item.action) {
    case "onboarding":
      return `/onboarding?orderItemId=${encodeURIComponent(orderItemId)}`;
    case "domain":
      return "#store-domain-setup";
    case "brand":
      return `mailto:${siteContact.email}?subject=${encodeURIComponent("Бранд материали — онлайн магазин")}`;
    default:
      return null;
  }
}

function rowActionLabel(item: OnlineStoreSetupItem): string {
  switch (item.action) {
    case "onboarding":
      return "Към онбординга";
    case "domain":
      return "Към домейн";
    case "brand":
      return "Имейл";
    default:
      return "";
  }
}

export function OnlineStoreSetupStatusCard({ orderItemId, items }: OnlineStoreSetupStatusCardProps) {
  const incomplete = hasIncompleteOnlineStoreSetup(items);
  const needsOnboarding = items.some((i) => !i.ok && i.action === "onboarding");
  const needsDomain = items.some((i) => !i.ok && i.id === "domain");
  const needsBrand = items.some((i) => !i.ok && i.id === "brand");

  return (
    <Card
      className={
        incomplete
          ? "border-amber-500/40 bg-amber-500/5 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
          : "border-emerald-500/30 bg-emerald-500/5 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
      }
    >
      <CardHeader>
        <CardTitle className="text-lg">Статус на настройката на магазина</CardTitle>
        <p className="text-sm text-muted-foreground font-normal">
          {incomplete
            ? "Провери кои стъпки липсват и ги довърши, за да стартираме по-бързо."
            : "Основните стъпки са отметнати. При нужда винаги можеш да се свържеш с нас."}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {items.map((row) => {
            const href = rowActionLink(row, orderItemId);
            return (
              <li
                key={row.id}
                className="flex gap-3 rounded-xl border border-border/80 bg-background/60 p-3 text-sm"
              >
                <div className="shrink-0 pt-0.5">
                  {row.ok ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
                  ) : (
                    <CircleAlert className="h-5 w-5 text-amber-600" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{row.label}</p>
                    {!row.ok && href ? (
                      <Button variant="link" className="h-auto p-0 text-sm" asChild>
                        <Link href={href}>{rowActionLabel(row)}</Link>
                      </Button>
                    ) : null}
                  </div>
                  {!row.ok ? (
                    <p className="text-muted-foreground leading-relaxed">{row.missingHint}</p>
                  ) : (
                    <p className="text-muted-foreground">Конфигурирано</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {incomplete ? (
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            {needsOnboarding ? (
              <Button asChild>
                <Link href={`/onboarding?orderItemId=${encodeURIComponent(orderItemId)}`}>
                  Отвори онбординга
                </Link>
              </Button>
            ) : null}
            {needsDomain ? (
              <Button variant="outline" asChild>
                <Link href="#store-domain-setup">Домейн и DNS</Link>
              </Button>
            ) : null}
            {needsBrand ? (
              <Button variant="outline" asChild>
                <Link
                  href={`mailto:${siteContact.email}?subject=${encodeURIComponent("Бранд материали — онлайн магазин")}`}
                >
                  Имейл за бранд
                </Link>
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
