"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownUp,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  ExternalLink,
  Mail,
  RotateCcw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  getGoogleFreeAnalysisStatusLabel,
  getGoogleFreeAnalysisUrgencyLabel,
  GOOGLE_FREE_ANALYSIS_PAGE_PATH,
  GOOGLE_FREE_ANALYSIS_URGENCY_OPTIONS,
  googleFreeAnalysisFormFields,
} from "@/lib/data/google-free-analysis-content";
import type {
  GoogleFreeAnalysisLeadRow,
  GoogleFreeAnalysisLeadStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const CLIP_EMAIL_SUBJECT = "Безплатен анализ – вашият клип";

function buildClipEmailBody(name: string, clipUrl: string) {
  const greetingName = name.trim() || "{name}";
  const link = clipUrl.trim();

  return [
    `Здравейте, ${greetingName},`,
    "",
    "Това е обещаният клип за безплатен анализ с 3 съвета, за по-добро класиране в Google My Business.",
    "",
    "Линк към клипа:",
    link,
  ].join("\n");
}

function buildClipEmailMailto(email: string, name: string, clipUrl: string) {
  const subject = encodeURIComponent(CLIP_EMAIL_SUBJECT);
  const body = encodeURIComponent(buildClipEmailBody(name, clipUrl));
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

type StatusFilter = "pending" | "done" | "all";

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

function StatusBadge({ status }: { status: GoogleFreeAnalysisLeadStatus }) {
  return (
    <Badge
      variant={status === "done" ? "default" : "secondary"}
      className={
        status === "done"
          ? "bg-emerald-600/15 text-emerald-700 hover:bg-emerald-600/15 dark:text-emerald-400"
          : undefined
      }
    >
      {getGoogleFreeAnalysisStatusLabel(status)}
    </Badge>
  );
}

export default function GoogleFreeAnalysisLeadsTable({
  initialLeads,
}: {
  initialLeads: GoogleFreeAnalysisLeadRow[];
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [sortByDate, setSortByDate] = useState<"newest" | "oldest">("newest");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [greetingName, setGreetingName] = useState("");
  const [clipUrl, setClipUrl] = useState("");

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) ?? null,
    [leads, selectedLeadId],
  );

  useEffect(() => {
    if (!selectedLeadId) {
      setGreetingName("");
      setClipUrl("");
      return;
    }
    const lead = leads.find((item) => item.id === selectedLeadId);
    if (!lead) return;
    setGreetingName(lead.name);
    setClipUrl("");
    // Only reset when opening a different lead, not on status updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeadId]);

  const pendingCount = useMemo(
    () => leads.filter((lead) => lead.status === "pending").length,
    [leads],
  );

  const visibleLeads = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = leads.filter((lead) => {
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
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
  }, [leads, search, sortByDate, statusFilter]);

  const onStatusChange = useCallback(
    async (id: string, status: GoogleFreeAnalysisLeadStatus) => {
      setSavingId(id);
      try {
        const res = await fetch(`/api/admin/google-free-analysis/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("Status update failed");

        const data = (await res.json()) as { lead?: GoogleFreeAnalysisLeadRow };
        if (!data.lead) return;

        setLeads((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: data.lead!.status } : item)),
        );
        toast.success(
          status === "done" ? "Маркирано като готово" : "Върнато към чакащи",
        );
      } catch {
        toast.error("Неуспешна промяна на статуса");
      } finally {
        setSavingId(null);
      }
    },
    [],
  );

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
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Филтър статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Чакащи ({pendingCount})</SelectItem>
            <SelectItem value="done">Готови</SelectItem>
            <SelectItem value="all">Всички</SelectItem>
          </SelectContent>
        </Select>

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
                  Статус
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Записан на
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Действия
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
                  <td className="px-4 py-3 text-sm">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatBgDate(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLeadId(lead.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Детайли
                      </Button>
                      {lead.status === "pending" ? (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={savingId === lead.id}
                          onClick={() => void onStatusChange(lead.id, "done")}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Готово
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={savingId === lead.id}
                          onClick={() => void onStatusChange(lead.id, "pending")}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Върни
                        </Button>
                      )}
                    </div>
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
                <div className="flex flex-wrap items-center gap-2">
                  <SheetTitle className="text-xl">Заявка за Google анализ</SheetTitle>
                  <StatusBadge status={selectedLead.status} />
                </div>
                <SheetDescription>
                  {selectedLead.name} · записана на {formatBgDate(selectedLead.createdAt)}
                </SheetDescription>
              </SheetHeader>

              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
                <div className="space-y-2">
                  <Label htmlFor="lead-greeting-name" className="text-sm font-medium">
                    {googleFreeAnalysisFormFields.name}
                  </Label>
                  <div className="flex items-start gap-2 border-b border-border pb-3">
                    <Input
                      id="lead-greeting-name"
                      value={greetingName}
                      onChange={(event) => setGreetingName(event.target.value)}
                      placeholder={selectedLead.name}
                      className="min-w-0 flex-1"
                    />
                    <CopyButton value={greetingName || selectedLead.name} label="Име" />
                  </div>
                </div>

                <FormAnswer
                  label={googleFreeAnalysisFormFields.email}
                  value={selectedLead.email}
                  href={`mailto:${selectedLead.email}`}
                  copyable
                />

                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Изпрати клип по имейл</p>
                    <p className="text-xs text-muted-foreground">
                      Отваря имейл към {selectedLead.email} с попълнен шаблон.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead-clip-url" className="text-sm font-medium">
                      Линк към клипа
                    </Label>
                    <Input
                      id="lead-clip-url"
                      type="url"
                      value={clipUrl}
                      onChange={(event) => setClipUrl(event.target.value)}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                  <Button asChild className="w-full" variant="secondary">
                    <a
                      href={buildClipEmailMailto(
                        selectedLead.email,
                        greetingName || selectedLead.name,
                        clipUrl,
                      )}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Изпрати имейл
                    </a>
                  </Button>
                </div>

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

              <SheetFooter className="shrink-0 flex-col gap-2 border-t border-border bg-background px-6 py-4 sm:flex-col sm:space-x-0">
                {selectedLead.status === "pending" ? (
                  <Button
                    type="button"
                    className="w-full"
                    disabled={savingId === selectedLead.id}
                    onClick={() => void onStatusChange(selectedLead.id, "done")}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Маркирай видеото като готово
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    disabled={savingId === selectedLead.id}
                    onClick={() => void onStatusChange(selectedLead.id, "pending")}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Върни към чакащи
                  </Button>
                )}
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
