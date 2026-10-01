"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RankedStatsList, type RankedStatItem } from "@/components/admin/ranked-stats-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  META_ADS_PRODUCTS,
  getDefaultMetaAdsCampaignMap,
  type MetaAdsProduct,
  type MetaAdsProductId,
} from "@/config/meta-ads-products";
import { filterMetaAdsTrafficByCampaign } from "@/lib/analytics/meta-ads-traffic";
import { META_UTM_TYPE_PAID } from "@/lib/analytics/source";
import type { MetaAdsTrafficAggregate } from "@/lib/analytics/types";

type MetaAdsPanelProps = {
  stats: MetaAdsTrafficAggregate;
};

type EditableParamKey = "adset" | "creative";

const DEFAULT_EDITABLE_VALUES: Record<EditableParamKey, string> = {
  adset: "{{adset.name}}",
  creative: "{{ad.name}}",
};

/** Keep Meta `{{macros}}` readable while still encoding spaces/special chars. */
function encodeParamValue(value: string) {
  return encodeURIComponent(value).replace(/%7B/gi, "{").replace(/%7D/gi, "}");
}

function buildParamsString(campaign: string, values: Record<EditableParamKey, string>) {
  const parts = [
    `utm_type=${encodeParamValue(META_UTM_TYPE_PAID)}`,
    `campaign=${encodeParamValue(campaign.trim())}`,
  ];

  for (const key of ["adset", "creative"] as const) {
    const value = values[key].trim();
    if (!value) continue;
    parts.push(`${key}=${encodeParamValue(value)}`);
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

function ProductPanel({
  product,
  campaign,
  onCampaignChange,
  campaignOptions,
  stats,
  savingCampaign,
}: {
  product: MetaAdsProduct;
  campaign: string;
  onCampaignChange: (campaign: string) => void;
  campaignOptions: string[];
  stats: MetaAdsTrafficAggregate;
  savingCampaign: boolean;
}) {
  const [copied, setCopied] = useState<"params" | "url" | null>(null);
  const [values, setValues] = useState<Record<EditableParamKey, string>>({
    ...DEFAULT_EDITABLE_VALUES,
  });
  const [customCampaign, setCustomCampaign] = useState(campaign);

  useEffect(() => {
    setCustomCampaign(campaign);
  }, [campaign]);

  const filteredStats = useMemo(
    () => filterMetaAdsTrafficByCampaign(stats, campaign),
    [stats, campaign],
  );

  const adsetItems = useMemo(
    () => toDimensionItems(filteredStats.byAdset),
    [filteredStats.byAdset],
  );
  const creativeItems = useMemo(
    () => toDimensionItems(filteredStats.byCreative),
    [filteredStats.byCreative],
  );

  const paramsString = useMemo(
    () => buildParamsString(campaign, values),
    [campaign, values],
  );

  const exampleUrl = useMemo(() => {
    const path = `${product.landingPath}?${paramsString}`;
    if (typeof window === "undefined") return `https://digistart.bg${path}`;
    return `${window.location.origin}${path}`;
  }, [paramsString, product.landingPath]);

  async function copyText(text: string, kind: "params" | "url") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  const selectOptions = useMemo(() => {
    const set = new Set<string>([...campaignOptions, campaign, product.defaultCampaign]);
    return Array.from(set)
      .map((entry) => entry.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "bg"));
  }, [campaignOptions, campaign, product.defaultCampaign]);

  return (
    <div className="space-y-6">
      <Card data-admin-animate className="bg-card border-border">
        <CardHeader>
          <CardTitle>Кампания за {product.label}</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Избери коя Meta кампания влиза в този продукт. Ad set и creative се следят под нея.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <Label htmlFor={`meta-campaign-select-${product.id}`}>Кампания</Label>
              <select
                id={`meta-campaign-select-${product.id}`}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                value={selectOptions.includes(campaign) ? campaign : ""}
                disabled={savingCampaign}
                onChange={(event) => {
                  const next = event.target.value;
                  if (next) onCampaignChange(next);
                }}
              >
                <option value="" disabled>
                  Избери кампания…
                </option>
                {selectOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <Label htmlFor={`meta-campaign-custom-${product.id}`}>
                Или въведи име на кампания
              </Label>
              <Input
                id={`meta-campaign-custom-${product.id}`}
                value={customCampaign}
                onChange={(event) => setCustomCampaign(event.target.value)}
                placeholder={product.defaultCampaign}
                autoComplete="off"
                spellCheck={false}
                disabled={savingCampaign}
              />
            </div>
            <button
              type="button"
              disabled={savingCampaign || !customCampaign.trim()}
              onClick={() => onCampaignChange(customCampaign.trim())}
              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-muted transition disabled:opacity-50"
            >
              {savingCampaign ? "Запис…" : "Запази"}
            </button>
          </div>
        </CardContent>
      </Card>

      <Card data-admin-animate className="bg-card border-border">
        <CardHeader>
          <CardTitle>URL параметри</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Кампанията е заключена. Променяш само ad set и creative. Копирай параметрите в Meta Ads
            → URL parameters.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Параметри</p>
            <code className="block whitespace-pre-wrap break-all text-xs leading-relaxed text-foreground">
              {paramsString}
            </code>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyText(paramsString, "params")}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition"
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
              onClick={() => setValues({ ...DEFAULT_EDITABLE_VALUES })}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition"
            >
              <RotateCcw className="h-4 w-4" />
              Нулирай ad set / creative
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Campaign</Label>
              <Input value={campaign} readOnly className="bg-muted/40" />
              <p className="text-xs text-muted-foreground">Фиксирана за този продукт</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`meta-adset-${product.id}`}>Ad set</Label>
              <Input
                id={`meta-adset-${product.id}`}
                value={values.adset}
                onChange={(event) =>
                  setValues((current) => ({ ...current, adset: event.target.value }))
                }
                placeholder="{{adset.name}}"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`meta-creative-${product.id}`}>Creative</Label>
              <Input
                id={`meta-creative-${product.id}`}
                value={values.creative}
                onChange={(event) =>
                  setValues((current) => ({ ...current, creative: event.target.value }))
                }
                placeholder="{{ad.name}}"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Лендинг:{" "}
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
            <p className="text-3xl font-bold tabular-nums">{filteredStats.totalViews}</p>
          </CardContent>
        </Card>
        <Card data-admin-animate className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Регистрации</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">
              {filteredStats.totalRegistrations}
            </p>
          </CardContent>
        </Card>
        <Card data-admin-animate className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Конверсия</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">
              {formatRate(filteredStats.conversionRate)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-admin-animate className="bg-card border-border">
          <CardHeader>
            <CardTitle>По ad set</CardTitle>
          </CardHeader>
          <CardContent>
            <RankedStatsList
              items={adsetItems}
              emptyMessage="Няма данни по ad set за тази кампания."
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
              emptyMessage="Няма данни по creative за тази кампания."
              countLabel="прегледа"
            />
          </CardContent>
        </Card>
      </div>

      <Card data-admin-animate className="bg-card border-border">
        <CardHeader>
          <CardTitle>Ad set → Creative</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Прегледи и регистрации за кампания „{campaign}“
          </p>
        </CardHeader>
        <CardContent>
          {filteredStats.rows.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Все още няма платен трафик за тази кампания.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left py-2 px-3">Ad set</th>
                    <th className="text-left py-2 px-3">Creative</th>
                    <th className="text-right py-2 px-3">Прегледи</th>
                    <th className="text-right py-2 px-3">Регистрации</th>
                    <th className="text-right py-2 px-3">CR</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStats.rows.map((row) => (
                    <tr key={row.key} className="border-b border-border/50 last:border-0">
                      <td className="py-2 px-3">{row.adset}</td>
                      <td className="py-2 px-3">{row.creative}</td>
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

export function MetaAdsPanel({ stats }: MetaAdsPanelProps) {
  const [activeProduct, setActiveProduct] = useState<MetaAdsProductId>("google-analysis");
  const [campaignMap, setCampaignMap] = useState(getDefaultMetaAdsCampaignMap);
  const [savingCampaign, setSavingCampaign] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/meta-ads-campaigns", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { campaigns?: Record<MetaAdsProductId, string> } | null) => {
        if (cancelled || !data?.campaigns) return;
        setCampaignMap((current) => ({ ...current, ...data.campaigns }));
      })
      .catch(() => {
        /* keep defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const campaignOptions = useMemo(
    () => stats.byCampaign.map((entry) => entry.label),
    [stats.byCampaign],
  );

  async function saveCampaign(productId: MetaAdsProductId, campaign: string) {
    const trimmed = campaign.trim();
    if (!trimmed) return;

    const nextMap = { ...campaignMap, [productId]: trimmed };
    setCampaignMap(nextMap);
    setSavingCampaign(true);
    try {
      const response = await fetch("/api/admin/meta-ads-campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaigns: nextMap }),
      });
      if (!response.ok) return;
      const data = (await response.json()) as {
        campaigns?: Record<MetaAdsProductId, string>;
      };
      if (data.campaigns) setCampaignMap(data.campaigns);
    } finally {
      setSavingCampaign(false);
    }
  }

  return (
    <Tabs
      value={activeProduct}
      onValueChange={(value) => setActiveProduct(value as MetaAdsProductId)}
      className="space-y-6"
    >
      <TabsList className="inline-flex h-auto w-max flex-wrap justify-start gap-1 p-1">
        {META_ADS_PRODUCTS.map((product) => (
          <TabsTrigger key={product.id} value={product.id} className="px-3 py-1.5">
            {product.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {META_ADS_PRODUCTS.map((product) => (
        <TabsContent key={product.id} value={product.id} className="mt-0 space-y-6">
          <ProductPanel
            product={product}
            campaign={campaignMap[product.id] || product.defaultCampaign}
            onCampaignChange={(campaign) => void saveCampaign(product.id, campaign)}
            campaignOptions={campaignOptions}
            stats={stats}
            savingCampaign={savingCampaign}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
