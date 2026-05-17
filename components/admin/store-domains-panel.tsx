"use client";

import { useEffect, useState } from "react";
import { Globe, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  STORE_DOMAIN_STATUS_LABELS,
  type StoreDomainDto,
  type StoreDomainStatus,
} from "@/lib/store-dns";

type DomainWithUser = StoreDomainDto & {
  user: { id: string; email: string; name: string | null } | null;
};

function statusVariant(
  status: StoreDomainStatus,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "configured") return "default";
  if (status === "misconfigured") return "destructive";
  return "secondary";
}

export function StoreDomainsPanel() {
  const [domains, setDomains] = useState<DomainWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/store-domains")
      .then((r) => r.json())
      .then((data: { domains?: DomainWithUser[] }) => {
        setDomains(data.domains ?? []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: StoreDomainStatus) => {
    setUpdatingId(id);
    await fetch("/api/admin/store-domains", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setUpdatingId(null);
    load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5" />
          Домейни на магазини ({domains.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : domains.length === 0 ? (
          <p className="text-sm text-muted-foreground">Няма подадени домейни.</p>
        ) : (
          <ul className="space-y-3">
            {domains.map((d) => (
              <li
                key={d.id}
                className="rounded-lg border border-border p-3 text-sm space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-mono font-medium">{d.domain}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.user?.name ?? d.user?.email ?? d.userId}
                    </p>
                  </div>
                  <Badge variant={statusVariant(d.status)}>
                    {STORE_DOMAIN_STATUS_LABELS[d.status]}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-[180px] flex-1">
                    <Label className="text-xs text-muted-foreground">Статус</Label>
                    <Select
                      value={d.status}
                      disabled={updatingId === d.id}
                      onValueChange={(v) => updateStatus(d.id, v as StoreDomainStatus)}
                    >
                      <SelectTrigger className="mt-1 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Изчаква проверка</SelectItem>
                        <SelectItem value="configured">Конфигуриран</SelectItem>
                        <SelectItem value="misconfigured">Има проблем</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground pb-2">
                    Order item: <span className="font-mono">{d.orderItemId.slice(0, 8)}…</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
