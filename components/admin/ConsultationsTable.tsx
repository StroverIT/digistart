"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowDownUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { formatConsultationSourceLabel } from "@/lib/consultation/source-label";

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
