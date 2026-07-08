"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DigitalRoadmapLeadRow } from "@/lib/types";

function formatBgDate(iso: string) {
  return new Date(iso).toLocaleString("bg-BG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Sofia",
  });
}

export function DigitalRoadmapLeadsPanel() {
  const [leads, setLeads] = useState<DigitalRoadmapLeadRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/digital-roadmap-leads");
      if (!res.ok) {
        throw new Error("load failed");
      }
      const data = (await res.json()) as { leads?: DigitalRoadmapLeadRow[] };
      setLeads(data.leads ?? []);
    } catch {
      toast.error("Неуспешно зареждане на заявките за пътна карта.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card data-admin-animate className="bg-card border-border">
      <CardHeader>
        <CardTitle>Дигитална пътна карта (PDF)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Заявки за безплатното ръководство за онлайн продажби
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground py-6">Зареждане...</p>
        ) : leads.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Няма заявки за пътната карта</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Име
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Имейл
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Източник
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Записан на
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((row) => (
                  <tr key={row.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 font-mono text-sm">{row.email}</td>
                    <td className="px-4 py-3 text-sm">{row.source}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatBgDate(row.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
