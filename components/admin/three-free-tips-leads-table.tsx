"use client";

import { useMemo, useState } from "react";
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

export default function ThreeFreeTipsLeadsTable({
  initialLeads,
}: {
  initialLeads: ThreeFreeTipsLeadRow[];
}) {
  const [leads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

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
