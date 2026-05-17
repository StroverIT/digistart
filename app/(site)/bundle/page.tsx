import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import {
  BUNDLE_COMPARISON_ROWS,
  subscriptionPlans,
  type PlanId,
} from "@/lib/data/plans";
import {
  BundleComparisonCellContent,
  bundleCellClassName,
} from "@/components/plans/bundle-comparison-cell";
import { PlanSelectButton } from "@/components/plans/plan-select-button";

export const metadata: Metadata = {
  title: "Сравнение на пакети",
  description:
    "Пълно сравнение на абонаментните пакети Digi: какво е включено, месечни и еднократни цени.",
};

const PLAN_ORDER: PlanId[] = ["start", "growth", "full"];

export default function BundlePage() {
  return (
    <main className="pt-20 pb-16 md:pt-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button variant="ghost" className="mb-2 -ml-2 text-muted-foreground" asChild>
              <Link href="/#plans">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад към плановете
              </Link>
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Абонаментни пакети</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Сравни какво е включено във всеки пакет. Цените са с ДДС в евро; месечният абонамент се
              таксува всеки месец, еднократните суми — при първото плащане.
            </p>
            <p className="mt-2 text-sm text-foreground/90 max-w-2xl">
              Всички пакети с онлайн магазин включват <strong className="font-medium">хостинг</strong> и{" "}
              <strong className="font-medium">SSL сертификат</strong> — без допълнителни такси за
              сигурна HTTPS връзка.
            </p>
          </div>
        </div>

        <section aria-labelledby="compare-heading" className="mb-16">
          <h2 id="compare-heading" className="text-xl font-semibold mb-4">
            Сравнителна таблица
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th
                    scope="col"
                    className="sticky left-0 z-10 bg-muted/95 backdrop-blur px-4 py-4 text-left font-semibold border-r border-border min-w-[200px]"
                  >
                    Функция / услуга
                  </th>
                  {PLAN_ORDER.map((planId) => {
                    const plan = subscriptionPlans.find((p) => p.id === planId)!;
                    return (
                      <th
                        key={planId}
                        scope="col"
                        className="px-4 py-4 text-center font-semibold min-w-[140px]"
                      >
                        <div className="flex flex-col gap-1 items-center">
                          <span>{plan.name}</span>
                          {plan.discountPercent > 0 && (
                            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                              −{plan.discountPercent}%
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {BUNDLE_COMPARISON_ROWS.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0">
                    <th
                      scope="row"
                      className="sticky left-0 z-10 bg-background/95 backdrop-blur px-4 py-3 text-left font-normal text-foreground border-r border-border"
                    >
                      {row.label}
                    </th>
                    {PLAN_ORDER.map((planId) => (
                      <td
                        key={planId}
                        className={bundleCellClassName(row.values[planId])}
                      >
                        <BundleComparisonCellContent value={row.values[planId]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Легенда: отметка = включено в пакета; кръстче = не е включено; текст = конкретна стойност
            (напр. брой канали или процент отстъпка).
          </p>
        </section>

        <h2 className="text-xl font-semibold mb-6">Детайли по план</h2>
        <div className="space-y-12">
          {subscriptionPlans.map((plan) => (
            <section
              key={plan.id}
              id={`plan-${plan.id}`}
              className="scroll-mt-24 rounded-xl border border-border bg-card/50 p-6 md:p-8"
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground mt-1">{plan.tagline}</p>
                  <p className="mt-4 text-sm text-muted-foreground max-w-xl">{plan.description}</p>
                </div>
                <div className="shrink-0 rounded-lg border border-border bg-background p-4 min-w-[220px]">
                  {plan.discountPercent > 0 && (
                    <p className="mb-1 text-xs text-destructive line-through decoration-destructive decoration-2">
                      Каталог:{" "}
                      <Price
                        value={plan.listMonthly}
                        className="[&>span]:text-destructive [&>span:last-child]:text-destructive/75"
                      />
                      /мес
                    </p>
                  )}
                  <p className="text-xs font-medium text-muted-foreground uppercase">Месечно</p>
                  <p className="text-2xl font-bold">
                    <Price value={plan.monthlyTotal} />
                    <span className="text-sm font-normal text-muted-foreground">/мес</span>
                  </p>
                  <p className="text-xs font-medium text-muted-foreground uppercase mt-3">
                    Еднократно при старт
                  </p>
                  <p className="text-lg font-semibold">
                    {plan.oneTimeTotal > 0 ? (
                      <Price value={plan.oneTimeTotal} />
                    ) : (
                      <span className="text-muted-foreground font-normal">—</span>
                    )}
                  </p>
                  <PlanSelectButton planId={plan.id} className="mt-4 w-full" />
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Редове в абонамента (от каталога)
                </h4>
                <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                  {plan.lineItems.map((line) => (
                    <li
                      key={line.label}
                      className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between px-4 py-3 bg-background/80"
                    >
                      <span className="text-sm">{line.label}</span>
                      <span className="text-sm tabular-nums">
                        {line.monthlyAmount > 0 && (
                          <span className="text-primary font-medium">
                            <Price value={line.monthlyAmount} />/мес
                          </span>
                        )}
                        {line.oneTimeAmount != null && line.oneTimeAmount > 0 && (
                          <span className="text-muted-foreground sm:ml-3">
                            + <Price value={line.oneTimeAmount} /> еднократно
                          </span>
                        )}
                        {line.monthlyAmount === 0 &&
                          (line.oneTimeAmount == null || line.oneTimeAmount === 0) && (
                            <span className="text-muted-foreground">—</span>
                          )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Какво получаваш
                </h4>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
