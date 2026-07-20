"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownUp,
  Check,
  Copy,
  Eye,
  ExternalLink,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  getGoogleFreeAnalysisUrgencyLabel,
  GOOGLE_FREE_ANALYSIS_PAGE_PATH,
  GOOGLE_FREE_ANALYSIS_URGENCY_OPTIONS,
  googleFreeAnalysisFormFields,
} from "@/lib/data/google-free-analysis-content";
import type { GoogleFreeAnalysisLeadRow } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatBgDate(iso: string) {
  return new Date(iso).toLocaleString("bg-BG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Sofia",
  });
}

function toHref(value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} е копиран`);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Неуспешно копиране");
    }
  }, [label, value]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0 text-muted-foreground"
      onClick={() => void onCopy()}
      aria-label={`Копирай ${label.toLowerCase()}`}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

function FormAnswer({
  label,
  value,
  href,
  copyable = false,
}: {
  label: string;
  value: string;
  href?: string;
  copyable?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium leading-none">{label}</p>
      <div className="flex items-start gap-2 border-b border-border pb-3">
        <div className="min-w-0 flex-1 text-sm">
          {href ? (
            <a
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className="break-all hover:text-primary"
            >
              {value}
            </a>
          ) : (
            <p className="wrap-break-word">{value}</p>
          )}
        </div>
        {copyable ? <CopyButton value={value} label={label} /> : null}
      </div>
    </div>
  );
}

export default function GoogleFreeAnalysisLeadsTable({
  initialLeads,
}: {
  initialLeads: GoogleFreeAnalysisLeadRow[];
}) {
  const [leads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [sortByDate, setSortByDate] = useState<"newest" | "oldest">("newest");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) ?? null,
    [leads, selectedLeadId],
  );

  const visibleLeads = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = leads.filter((lead) => {
      if (!normalizedSearch) return true;
      return (
        lead.email.toLowerCase().includes(normalizedSearch) ||
        lead.name.toLowerCase().includes(normalizedSearch) ||
        lead.company.toLowerCase().includes(normalizedSearch)
      );
    });

    return filtered.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortByDate === "newest" ? bTime - aTime : aTime - bTime;
    });
  }, [leads, search, sortByDate]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Търсене по име, имейл или фирма..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={sortByDate}
          onValueChange={(value) => setSortByDate(value as "newest" | "oldest")}
        >
          <SelectTrigger className="w-full sm:w-44">
            <ArrowDownUp className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Сортиране" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Дата: най-нови</SelectItem>
            <SelectItem value="oldest">Дата: най-стари</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {visibleLeads.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Няма намерени заявки</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Клиент
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  {googleFreeAnalysisFormFields.company}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Срок
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
                  <td className="px-4 py-3">
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-sm text-muted-foreground">{lead.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{lead.company}</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant="secondary">
                      {getGoogleFreeAnalysisUrgencyLabel(lead.urgency)}
                    </Badge>
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
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        >
          {!selectedLead ? null : (
            <>
              <SheetHeader className="shrink-0 space-y-1 border-b border-border px-6 py-5 pr-12 text-left">
                <SheetTitle className="text-xl">Заявка за Google анализ</SheetTitle>
                <SheetDescription>
                  {selectedLead.name} · записана на {formatBgDate(selectedLead.createdAt)}
                </SheetDescription>
              </SheetHeader>

              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
                <FormAnswer
                  label={googleFreeAnalysisFormFields.name}
                  value={selectedLead.name}
                  copyable
                />
                <FormAnswer
                  label={googleFreeAnalysisFormFields.email}
                  value={selectedLead.email}
                  href={`mailto:${selectedLead.email}`}
                  copyable
                />
                <FormAnswer
                  label={googleFreeAnalysisFormFields.phone}
                  value={selectedLead.phone}
                  href={`tel:${selectedLead.phone.replace(/\s+/g, "")}`}
                  copyable
                />
                <FormAnswer
                  label={googleFreeAnalysisFormFields.website}
                  value={selectedLead.website}
                  href={toHref(selectedLead.website)}
                  copyable
                />
                <FormAnswer
                  label={googleFreeAnalysisFormFields.company}
                  value={selectedLead.company}
                  copyable
                />
                <FormAnswer
                  label={googleFreeAnalysisFormFields.googleMapsUrl}
                  value={selectedLead.googleMapsUrl}
                  href={toHref(selectedLead.googleMapsUrl)}
                  copyable
                />

                <div className="space-y-3">
                  <p className="text-sm font-medium leading-none">
                    {googleFreeAnalysisFormFields.urgency}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {GOOGLE_FREE_ANALYSIS_URGENCY_OPTIONS.map((option) => {
                      const isSelected = selectedLead.urgency === option.value;
                      return (
                        <div
                          key={option.value}
                          className={cn(
                            "rounded-full border px-4 py-3 text-center text-sm font-medium",
                            isSelected
                              ? "border-accent bg-accent/10 text-foreground"
                              : "border-border bg-muted/20 text-muted-foreground",
                          )}
                        >
                          {option.label}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <section className="space-y-2 border-t border-border pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Метаданни
                  </h3>
                  <dl className="grid gap-2 text-xs text-muted-foreground">
                    <div className="flex items-start justify-between gap-3">
                      <dt>ID</dt>
                      <dd className="break-all text-right font-mono text-foreground/80">
                        {selectedLead.id}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt>Източник</dt>
                      <dd className="text-right text-foreground/80">{selectedLead.source}</dd>
                    </div>
                    {selectedLead.pagePath ? (
                      <div className="flex items-start justify-between gap-3">
                        <dt>Страница</dt>
                        <dd className="break-all text-right font-mono text-foreground/80">
                          {selectedLead.pagePath}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </section>
              </div>

              <SheetFooter className="shrink-0 border-t border-border bg-background px-6 py-4 sm:flex-row sm:justify-stretch">
                <Button asChild variant="outline" className="w-full">
                  <Link href={GOOGLE_FREE_ANALYSIS_PAGE_PATH} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Отвори формата
                  </Link>
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
