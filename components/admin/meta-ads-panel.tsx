"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RankedStatsList, type RankedStatItem } from "@/components/admin/ranked-stats-list";
import { META_UTM_TYPE_PAID } from "@/lib/analytics/source";
import type { MetaAdsTrafficAggregate } from "@/lib/analytics/types";

type MetaAdsPanelProps = {
  stats: MetaAdsTrafficAggregate;
};

type ParamKey = "campaign" | "adset" | "creative";

type ParamField = {
  key: ParamKey;
  label: string;
  hint: string;
};

const DEFAULT_PARAM_VALUES: Record<ParamKey, string> = {
  campaign: "{{campaign.name}}",
  adset: "{{adset.name}}",
  creative: "{{ad.name}}",
};

const PARAM_FIELDS: ParamField[] = [
  { key: "campaign", label: "Campaign", hint: "Име на кампанията · {{campaign.name}}" },
  { key: "adset", label: "Ad set", hint: "Име на ad set · {{adset.name}}" },
  { key: "creative", label: "Creative", hint: "Име на creative / ad · {{ad.name}}" },
];

const LANDING_PATH = "/google/three-free-tips";

/** Keep Meta `{{macros}}` readable while still encoding spaces/special chars. */
function encodeParamValue(value: string) {
  return encodeURIComponent(value).replace(/%7B/gi, "{").replace(/%7D/gi, "}");
}

function buildParamsString(values: Record<ParamKey, string>) {
  const parts = [`utm_type=${encodeParamValue(META_UTM_TYPE_PAID)}`];

  for (const field of PARAM_FIELDS) {
    const value = values[field.key].trim();
    if (!value) continue;
    parts.push(`${field.key}=${encodeParamValue(value)}`);
  }

  return parts.join("&");
}

function formatRate(rate: number) {
  return `${rate.toLocaleString("bg-BG", { maximumFractionDigits: 2 })}%`;
}

function toDimensionItems(
  entries: MetaAdsTrafficAggregate["byCampaign"],
): RankedStatItem[] {
  return entries.map((entry) => ({
    id: entry.key,
    label: entry.label,
    count: entry.views,
    subtitle: `${entry.registrations} регистрации · ${formatRate(entry.conversionRate)} CR`,
  }));
}

export function MetaAdsPanel({ stats }: MetaAdsPanelProps) {
  const [copied, setCopied] = useState<"params" | "url" | null>(null);
  const [values, setValues] = useState<Record<ParamKey, string>>({ ...DEFAULT_PARAM_VALUES });
  const campaignItems = useMemo(() => toDimensionItems(stats.byCampaign), [stats.byCampaign]);
  const adsetItems = useMemo(() => toDimensionItems(stats.byAdset), [stats.byAdset]);
  const creativeItems = useMemo(() => toDimensionItems(stats.byCreative), [stats.byCreative]);

  const paramsString = useMemo(() => buildParamsString(values), [values]);
  const exampleUrl = useMemo(() => {
    const path = paramsString ? `${LANDING_PATH}?${paramsString}` : LANDING_PATH;
    if (typeof window === "undefined") return `https://digistart.bg${path}`;
    return `${window.location.origin}${path}`;
  }, [paramsString]);

  async function copyText(text: string, kind: "params" | "url") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  function updateField(key: ParamKey, next: string) {
    setValues((current) => ({ ...current, [key]: next }));
  }

  return (
    <div className="space-y-6">
      <Card data-admin-animate className="bg-card border-border">
        <CardHeader>
          <CardTitle>URL параметри за Meta Ads</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Попълни campaign / ad set / creative - низът отгоре се обновява веднага.
            `utm_type=paid` се добавя автоматично. Данните се пазят в localStorage през редиректи
            и се пращат при регистрация.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Параметри</p>
            <code className="block whitespace-pre-wrap break-all text-xs leading-relaxed text-foreground">
              {paramsString || "(попълни поне едно поле)"}
            </code>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyText(paramsString, "params")}
              disabled={!paramsString}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition disabled:opacity-50"
            >
              {copied === "params" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied === "params" ? "Копирано" : "Копирай параметрите"}
            </button>
            <button
              type="button"
              onClick={() => void copyText(exampleUrl, "url")}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition"
            >
              {copied === "url" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied === "url" ? "Копирано" : "Копирай пълен линк"}
            </button>
            <button
              type="button"
              onClick={() => setValues({ ...DEFAULT_PARAM_VALUES })}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition"
            >
              <RotateCcw className="h-4 w-4" />
              Нулирай
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PARAM_FIELDS.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={`meta-param-${field.key}`}>{field.label}</Label>
                <Input
                  id={`meta-param-${field.key}`}
                  value={values[field.key]}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  placeholder={DEFAULT_PARAM_VALUES[field.key]}
                  autoComplete="off"
                  spellCheck={false}
                />
                <p className="text-xs text-muted-foreground">{field.hint}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Пример линк:{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px] break-all">{exampleUrl}</code>
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card data-admin-animate className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Прегледи (кликове)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{stats.totalViews}</p>
          </CardContent>
        </Card>
        <Card data-admin-animate className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Регистрации</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{stats.totalRegistrations}</p>
          </CardContent>
        </Card>
        <Card data-admin-animate className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Конверсия</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{formatRate(stats.conversionRate)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card data-admin-animate className="bg-card border-border">
          <CardHeader>
            <CardTitle>По кампания</CardTitle>
          </CardHeader>
          <CardContent>
            <RankedStatsList
              items={campaignItems}
              emptyMessage="Все още няма Meta рекламен трафик."
              countLabel="прегледа"
            />
          </CardContent>
        </Card>
        <Card data-admin-animate className="bg-card border-border">
          <CardHeader>
            <CardTitle>По ad set</CardTitle>
          </CardHeader>
          <CardContent>
            <RankedStatsList
              items={adsetItems}
              emptyMessage="Няма данни по ad set."
              countLabel="прегледа"
            />
          </CardContent>
        </Card>
        <Card data-admin-animate className="bg-card border-border">
          <CardHeader>
            <CardTitle>По creative</CardTitle>
          </CardHeader>
          <CardContent>
            <RankedStatsList
              items={creativeItems}
              emptyMessage="Няма данни по creative."
              countLabel="прегледа"
            />
          </CardContent>
        </Card>
      </div>

      <Card data-admin-animate className="bg-card border-border">
        <CardHeader>
          <CardTitle>Кампания → Ad set → Creative</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Прегледи и регистрации за всяка комбинация
          </p>
        </CardHeader>
        <CardContent>
          {stats.rows.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Закачи URL параметрите по-горе и пусни рекламите - данните ще се появят тук.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left py-2 px-3">Кампания</th>
                    <th className="text-left py-2 px-3">Ad set</th>
                    <th className="text-left py-2 px-3">Creative</th>
                    <th className="text-right py-2 px-3">Прегледи</th>
                    <th className="text-right py-2 px-3">Регистрации</th>
                    <th className="text-right py-2 px-3">CR</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.rows.map((row) => (
                    <tr key={row.key} className="border-b border-border/50 last:border-0">
                      <td className="py-2 px-3">
                        <p className="font-medium">{row.campaign}</p>
                        {row.campaignId ? (
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {row.campaignId}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-2 px-3">
                        <p>{row.adset}</p>
                        {row.adsetId ? (
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {row.adsetId}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-2 px-3">
                        <p>{row.creative}</p>
                        {row.adId ? (
                          <p className="text-[11px] text-muted-foreground font-mono">{row.adId}</p>
                        ) : null}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums font-semibold">
                        {row.views}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums font-semibold">
                        {row.registrations}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums">
                        {formatRate(row.conversionRate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
