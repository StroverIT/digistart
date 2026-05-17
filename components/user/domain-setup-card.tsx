"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  STORE_DOMAIN_STATUS_LABELS,
  type StoreDomainDto,
  type StoreDomainStatus,
} from "@/lib/store-dns";

type DomainSetupCardProps = {
  orderItemId: string;
  vpsIp: string | null;
};

function statusVariant(
  status: StoreDomainStatus,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "configured") return "default";
  if (status === "misconfigured") return "destructive";
  return "secondary";
}

function CopyValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [value]);

  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 font-mono text-sm break-all">{value}</p>
        </div>
        <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={copy}>
          {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only">Копирай</span>
        </Button>
      </div>
    </div>
  );
}

export function DomainSetupCard({ orderItemId, vpsIp }: DomainSetupCardProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [record, setRecord] = useState<StoreDomainDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const apiBase = `/api/user/services/${orderItemId}/domain`;

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(apiBase)
      .then((r) => r.json())
      .then((data: { domain?: StoreDomainDto | null; error?: string }) => {
        if (data.domain) {
          setRecord(data.domain);
          setDomainInput(data.domain.domain);
        } else {
          setRecord(null);
        }
      })
      .catch(() => setError("Неуспешно зареждане на домейна."))
      .finally(() => setLoading(false));
  }, [apiBase]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const res = await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: domainInput }),
    });
    const data = (await res.json()) as { domain?: StoreDomainDto; error?: string };

    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Неуспешно запазване.");
      return;
    }

    if (data.domain) {
      setRecord(data.domain);
      setSuccess(
        record
          ? "Домейнът е обновен. Статусът е „Изчаква проверка“, докато потвърдим DNS настройките."
          : "Домейнът е записан. Следвай инструкциите по-долу и ще проверим настройката.",
      );
    }
  };

  if (loading) {
    return (
      <Card className="border-border bg-card/80 shadow-sm">
        <CardContent className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Зареждане…
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card/80 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-primary" />
            Домейн
          </CardTitle>
          {record ? (
            <Badge variant={statusVariant(record.status)}>
              {STORE_DOMAIN_STATUS_LABELS[record.status]}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {record?.status === "configured" ? (
          <Alert>
            <AlertTitle>Домейнът е конфигуриран</AlertTitle>
            <AlertDescription>
              Магазинът ти е достъпен на{" "}
              <a
                href={`https://${record.domain}`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary underline"
              >
                {record.domain}
              </a>
              .
            </AlertDescription>
          </Alert>
        ) : null}

        {record?.status === "misconfigured" ? (
          <Alert variant="destructive">
            <AlertTitle>Има проблем с DNS настройките</AlertTitle>
            <AlertDescription>
              Провери записите по-долу. Ако си променял настройките наскоро, изчакай до 24 часа за
              разпространение и натисни „Запази домейна“ отново.
            </AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="store-domain">Домейн на магазина</Label>
            <Input
              id="store-domain"
              name="domain"
              placeholder="magazin.bg"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">
              Без https:// и без www — само името (напр. <span className="font-mono">magazin.bg</span>
              ).
            </p>
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {success ? <p className="text-sm text-primary">{success}</p> : null}
          <Button type="submit" disabled={saving || !domainInput.trim()}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Запазване…
              </>
            ) : (
              "Запази домейна"
            )}
          </Button>
        </form>

        <div className="space-y-3 border-t border-border pt-6">
          <h3 className="font-semibold">Как да насочиш домейна</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            В панела на регистратора на домейна (или в Cloudflare) добави следните DNS записи.
            След като ги запазиш, натисни „Запази домейна“ — ще проверим настройката и ще
            конфигурираме сървъра (nginx).
          </p>

          {vpsIp ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <CopyValue label="A запис (@)" value={vpsIp} />
              <CopyValue label="A запис (www)" value={vpsIp} />
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>Липсва IP адрес на сървъра</AlertTitle>
              <AlertDescription>
                Свържи се с нас — ще ти изпратим IP адреса за DNS записите.
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-2">
            <p>
              <span className="font-medium text-foreground">Тип:</span> A
            </p>
            <p>
              <span className="font-medium text-foreground">Име / Host:</span>{" "}
              <span className="font-mono">@</span> и отделно <span className="font-mono">www</span>
            </p>
            <p>
              <span className="font-medium text-foreground">Стойност:</span> IP адресът по-горе
            </p>
            <p className="text-xs pt-1">
              TTL: по подразбиране или 300–3600 сек. Промените могат да отнемат до 24 часа.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
