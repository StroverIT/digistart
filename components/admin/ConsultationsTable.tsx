"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import {
  ArrowDownUp,
  Building2,
  CalendarDays,
  Check,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Mail,
  MapPin,
  Phone,
  Search,
  Video,
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
import { formatConsultationSourceLabel } from "@/lib/consultation/source-label";
import { cn } from "@/lib/utils";

type ConsultationStatus = "scheduled" | "attended" | "absent" | "cancelled";
type VisibleStatus = "scheduled" | "attended" | "absent";

type ConsultationItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
  date: string;
  time: string;
  source: "public" | "checkout";
  sourcePage?: string;
  pagePath?: string;
  status: ConsultationStatus;
  orderId?: string;
  createdAt: string;
  timezone?: string;
  meetUrl?: string;
  googleEventId?: string;
  meetingType?: "online" | "in_person";
  address?: string;
};

const statusLabel: Record<VisibleStatus, string> = {
  scheduled: "Scheduled",
  attended: "Attended",
  absent: "Absent",
};

const statusBadgeClass: Record<VisibleStatus, string> = {
  scheduled: "border-amber-200 bg-amber-50 text-amber-800",
  attended: "border-emerald-200 bg-emerald-50 text-emerald-800",
  absent: "border-rose-200 bg-rose-50 text-rose-800",
};

function formatBgDateTime(iso: string) {
  return new Date(iso).toLocaleString("bg-BG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Sofia",
  });
}

function formatSlotLabel(date: string, time: string, timezone?: string) {
  const parsed = new Date(`${date}T${time}:00`);
  if (Number.isNaN(parsed.getTime())) {
    return `${date} · ${time}`;
  }

  const day = parsed.toLocaleDateString("bg-BG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${day} · ${time} (${timezone ?? "Europe/Sofia"})`;
}

function looksLikeUrl(value: string) {
  return /^(https?:\/\/|www\.)/i.test(value.trim());
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

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-background px-3 py-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
            className="block truncate text-sm font-medium text-foreground hover:text-primary"
          >
            {value}
          </a>
        ) : (
          <p className="truncate text-sm font-medium">{value}</p>
        )}
      </div>
      <CopyButton value={value} label={label} />
    </div>
  );
}

export default function ConsultationsTable({
  initialConsultations,
}: {
  initialConsultations: ConsultationItem[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [consultations, setConsultations] = useState<ConsultationItem[]>(initialConsultations);
  const [searchEmail, setSearchEmail] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | VisibleStatus>("all");
  const [sortByDate, setSortByDate] = useState<"newest" | "oldest">("newest");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);

  const selectedConsultation = useMemo(
    () => consultations.find((item) => item.id === selectedConsultationId) ?? null,
    [consultations, selectedConsultationId]
  );

  const visibleConsultations = useMemo(() => {
    const normalizedSearch = searchEmail.trim().toLowerCase();
    const filtered = consultations.filter((consultation) => {
      if (normalizedSearch && !consultation.email.toLowerCase().includes(normalizedSearch)) {
        return false;
      }

      if (statusFilter !== "all" && consultation.status !== statusFilter) {
        return false;
      }

      return consultation.status !== "cancelled";
    });

    return filtered.sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.time}:00`).getTime();
      const bDate = new Date(`${b.date}T${b.time}:00`).getTime();
      return sortByDate === "newest" ? bDate - aDate : aDate - bDate;
    });
  }, [consultations, searchEmail, sortByDate, statusFilter]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const toolbar = root.querySelector<HTMLElement>("[data-consult-toolbar]");
      const rows = root.querySelectorAll<HTMLElement>("tbody tr");

      if (toolbar) {
        gsap.set(toolbar, { opacity: 0, y: 16 });
        gsap.to(toolbar, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
      }
      if (rows.length) {
        gsap.set(rows, { opacity: 0, y: 10 });
        gsap.to(rows, {
          opacity: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.04,
          ease: "power2.out",
          delay: 0.05,
        });
      }
    }, root);

    return () => ctx.revert();
  }, [initialConsultations.length]);

  const onStatusChange = async (id: string, status: VisibleStatus) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/consultations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        throw new Error("Status update failed");
      }
      const data = (await res.json()) as { consultation?: ConsultationItem };
      if (!data.consultation) return;

      setConsultations((prev) => prev.map((item) => (item.id === id ? data.consultation! : item)));
    } catch {
      // Keep UX non-blocking while allowing retry from selector.
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div ref={rootRef} className="space-y-4">
      <div data-consult-toolbar className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Търсене по имейл..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as "all" | VisibleStatus)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Филтър статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всички</SelectItem>
            <SelectItem value="scheduled">{statusLabel.scheduled}</SelectItem>
            <SelectItem value="attended">{statusLabel.attended}</SelectItem>
            <SelectItem value="absent">{statusLabel.absent}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortByDate}
          onValueChange={(value) => setSortByDate(value as "newest" | "oldest")}
        >
          <SelectTrigger className="w-full sm:w-44">
            <ArrowDownUp className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Сортиране" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Дата: най-нови</SelectItem>
            <SelectItem value="oldest">Дата: най-стари</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {visibleConsultations.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Няма намерени консултации</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Клиент
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Дата и час
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Бележки
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Източник
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Статус
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Meet
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Детайли
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleConsultations.map((consultation) => (
                <tr key={consultation.id} className="border-b border-border last:border-0">
                  <td className="py-3 px-4">
                    <div className="font-medium">{consultation.name}</div>
                    <div className="text-sm text-muted-foreground">{consultation.email}</div>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {consultation.date} {consultation.time} ({consultation.timezone ?? "Europe/Sofia"})
                  </td>
                  <td className="py-3 px-4 text-sm max-w-[220px]">
                    {consultation.notes ? (
                      <span className="line-clamp-2" title={consultation.notes}>
                        {consultation.notes}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div>{formatConsultationSourceLabel(consultation.sourcePage, consultation.pagePath, consultation.source)}</div>
                    {consultation.pagePath ? (
                      <div className="text-xs text-muted-foreground">{consultation.pagePath}</div>
                    ) : null}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <Select
                      value={consultation.status as VisibleStatus}
                      onValueChange={(value) =>
                        void onStatusChange(consultation.id, value as VisibleStatus)
                      }
                      disabled={savingId === consultation.id}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">{statusLabel.scheduled}</SelectItem>
                        <SelectItem value="attended">{statusLabel.attended}</SelectItem>
                        <SelectItem value="absent">{statusLabel.absent}</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {consultation.meetingType === "in_person" ? (
                      <span title={consultation.address}>
                        На място
                        {consultation.address ? ` — ${consultation.address}` : ""}
                      </span>
                    ) : consultation.meetUrl ? (
                      <a
                        href={consultation.meetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        Отвори Meet
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Няма</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedConsultationId(consultation.id)}
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
        open={Boolean(selectedConsultation)}
        onOpenChange={(open) => !open && setSelectedConsultationId(null)}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        >
          {!selectedConsultation ? null : (
            <>
              <SheetHeader className="shrink-0 space-y-3 border-b border-border px-6 py-5 pr-12 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      statusBadgeClass[selectedConsultation.status as VisibleStatus] ??
                        "border-border bg-muted text-foreground"
                    )}
                  >
                    {statusLabel[selectedConsultation.status as VisibleStatus] ??
                      selectedConsultation.status}
                  </Badge>
                  <Badge variant="secondary">
                    {selectedConsultation.meetingType === "in_person" ? (
                      <>
                        <MapPin className="h-3 w-3" />
                        На място
                      </>
                    ) : (
                      <>
                        <Video className="h-3 w-3" />
                        Онлайн
                      </>
                    )}
                  </Badge>
                </div>
                <div>
                  <SheetTitle className="text-2xl leading-tight">
                    {selectedConsultation.name}
                  </SheetTitle>
                  <SheetDescription className="mt-1.5 flex items-start gap-2 text-sm">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      {formatSlotLabel(
                        selectedConsultation.date,
                        selectedConsultation.time,
                        selectedConsultation.timezone
                      )}
                    </span>
                  </SheetDescription>
                </div>
              </SheetHeader>

              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Контакт
                  </h3>
                  <div className="space-y-2">
                    <ContactRow
                      icon={<Mail className="h-4 w-4" />}
                      label="Имейл"
                      value={selectedConsultation.email}
                      href={`mailto:${selectedConsultation.email}`}
                    />
                    <ContactRow
                      icon={<Phone className="h-4 w-4" />}
                      label="Телефон"
                      value={selectedConsultation.phone}
                      href={`tel:${selectedConsultation.phone.replace(/\s+/g, "")}`}
                    />
                    {selectedConsultation.company?.trim() ? (
                      <ContactRow
                        icon={<Building2 className="h-4 w-4" />}
                        label={
                          looksLikeUrl(selectedConsultation.company) ? "Уебсайт" : "Фирма"
                        }
                        value={selectedConsultation.company.trim()}
                        href={
                          looksLikeUrl(selectedConsultation.company)
                            ? toHref(selectedConsultation.company)
                            : undefined
                        }
                      />
                    ) : null}
                  </div>
                </section>

                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Бележки
                  </h3>
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    {selectedConsultation.notes?.trim() ? (
                      <p className="flex gap-2 whitespace-pre-wrap text-sm leading-relaxed">
                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <span>{selectedConsultation.notes}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Няма бележки</p>
                    )}
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Статус
                  </h3>
                  <Select
                    value={selectedConsultation.status as VisibleStatus}
                    onValueChange={(value) =>
                      void onStatusChange(selectedConsultation.id, value as VisibleStatus)
                    }
                    disabled={savingId === selectedConsultation.id}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">{statusLabel.scheduled}</SelectItem>
                      <SelectItem value="attended">{statusLabel.attended}</SelectItem>
                      <SelectItem value="absent">{statusLabel.absent}</SelectItem>
                    </SelectContent>
                  </Select>
                </section>

                {selectedConsultation.meetingType === "in_person" &&
                selectedConsultation.address?.trim() ? (
                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Адрес
                    </h3>
                    <div className="rounded-xl border border-border p-4 text-sm leading-relaxed">
                      {selectedConsultation.address}
                    </div>
                  </section>
                ) : null}

                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Източник
                  </h3>
                  <div className="rounded-xl border border-border p-4 space-y-2">
                    <p className="text-sm font-medium">
                      {formatConsultationSourceLabel(
                        selectedConsultation.sourcePage,
                        selectedConsultation.pagePath,
                        selectedConsultation.source
                      )}
                    </p>
                    {selectedConsultation.pagePath ? (
                      <p className="font-mono text-xs text-muted-foreground break-all">
                        {selectedConsultation.pagePath}
                      </p>
                    ) : null}
                  </div>
                </section>

                <section className="space-y-2 border-t border-border pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Технически данни
                  </h3>
                  <dl className="grid gap-2 text-xs text-muted-foreground">
                    <div className="flex items-start justify-between gap-3">
                      <dt>ID</dt>
                      <dd className="font-mono text-right break-all text-foreground/80">
                        {selectedConsultation.id}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt>Записана на</dt>
                      <dd className="text-right text-foreground/80">
                        {formatBgDateTime(selectedConsultation.createdAt)}
                      </dd>
                    </div>
                    {selectedConsultation.orderId ? (
                      <div className="flex items-start justify-between gap-3">
                        <dt>Поръчка</dt>
                        <dd className="font-mono text-right break-all text-foreground/80">
                          {selectedConsultation.orderId}
                        </dd>
                      </div>
                    ) : null}
                    {selectedConsultation.googleEventId ? (
                      <div className="flex items-start justify-between gap-3">
                        <dt>Calendar event</dt>
                        <dd className="font-mono text-right break-all text-foreground/80">
                          {selectedConsultation.googleEventId}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </section>
              </div>

              <SheetFooter className="shrink-0 border-t border-border bg-background px-6 py-4 sm:flex-row sm:justify-stretch">
                {selectedConsultation.meetingType !== "in_person" &&
                selectedConsultation.meetUrl ? (
                  <Button asChild className="w-full">
                    <a
                      href={selectedConsultation.meetUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Отвори Google Meet
                    </a>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedConsultationId(null)}
                  >
                    Затвори
                  </Button>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
