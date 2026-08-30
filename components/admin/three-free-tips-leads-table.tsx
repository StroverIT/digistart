"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ThreeFreeTipsLeadRow } from "@/lib/types";

function formatBgDate(iso: string) {
  return new Date(iso).toLocaleString("bg-BG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Sofia",
  });
}

function formatStageLabel(stage: number | null, lastStage: number) {
  const resolved = stage ?? 1;
  if (lastStage > 0 && resolved > lastStage) return `Завършил (${resolved})`;
  return String(resolved);
}

function formatVideoCtaSummary(clicks: ThreeFreeTipsLeadRow["videoCtaClicks"]) {
  if (clicks.length === 0) return "—";
  const latest = clicks[0]!;
  return `Етап ${latest.stage} (${clicks.length})`;
}

export default function ThreeFreeTipsLeadsTable({
  initialLeads,
  lastTipsEmailStage,
}: {
  initialLeads: ThreeFreeTipsLeadRow[];
  lastTipsEmailStage: number;
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) ?? null,
    [leads, selectedLeadId],
  );

  const visibleLeads = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return leads;
    return leads.filter((lead) => lead.email.toLowerCase().includes(normalizedSearch));
  }, [leads, search]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Търсене по имейл..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-10"
        />
      </div>

      {visibleLeads.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Няма записани абонати</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Имейл
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Статус
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Етап
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Гледай видеото
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Записан на
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Детайли
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-mono text-sm">{lead.email}</td>
                  <td className="px-4 py-3 text-sm">
                    {lead.status === "unsubscribed" ? (
                      <span className="text-muted-foreground">Отписан</span>
                    ) : (
                      <span>Активен</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatStageLabel(lead.tipsEmailStage, lastTipsEmailStage)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatVideoCtaSummary(lead.videoCtaClicks)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatBgDate(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLeadId(lead.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Детайли
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Sheet
        open={Boolean(selectedLead)}
        onOpenChange={(open) => !open && setSelectedLeadId(null)}
      >
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
          {!selectedLead ? null : (
            <>
              <SheetHeader className="space-y-1 border-b border-border px-6 py-5 pr-12 text-left">
                <SheetTitle className="text-xl">Абонамент: 3 безплатни съвета</SheetTitle>
                <SheetDescription>
                  Записан на {formatBgDate(selectedLead.createdAt)}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-6 py-5">
                <div className="space-y-2 border-b border-border pb-3">
                  <p className="text-sm font-medium">Имейл</p>
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="break-all text-sm hover:text-primary"
                  >
                    {selectedLead.email}
                  </a>
                </div>
                <div className="space-y-2 border-b border-border pb-3">
                  <p className="text-sm font-medium">Статус</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedLead.status === "unsubscribed"
                      ? `Отписан${selectedLead.unsubscribedAt ? ` на ${formatBgDate(selectedLead.unsubscribedAt)}` : ""}`
                      : "Активен"}
                  </p>
                </div>
                <div className="space-y-2 border-b border-border pb-3">
                  <p className="text-sm font-medium">Етап</p>
                  <p className="text-sm text-muted-foreground">
                    {formatStageLabel(selectedLead.tipsEmailStage, lastTipsEmailStage)}
                  </p>
                </div>
                <div className="space-y-2 border-b border-border pb-3">
                  <p className="text-sm font-medium">Последен кампаниен имейл</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedLead.tipsLastEmailSentAt
                      ? formatBgDate(selectedLead.tipsLastEmailSentAt)
                      : "Все още не е изпращан"}
                  </p>
                </div>
                <div className="space-y-2 border-b border-border pb-3">
                  <p className="text-sm font-medium">Кликове „Гледай видеото“</p>
                  {selectedLead.videoCtaClicks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Няма записани кликове</p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedLead.videoCtaClicks.map((click) => (
                        <li
                          key={`${click.stage}-${click.clickedAt}`}
                          className="text-sm text-muted-foreground"
                        >
                          Етап {click.stage} · {formatBgDate(click.clickedAt)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="space-y-2 border-b border-border pb-3">
                  <p className="text-sm font-medium">Източник</p>
                  <p className="text-sm text-muted-foreground">{selectedLead.source}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Форма</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/google/three-free-tips" target="_blank" rel="noreferrer">
                      /google/three-free-tips
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
