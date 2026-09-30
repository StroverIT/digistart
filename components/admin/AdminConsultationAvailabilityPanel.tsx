"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Lock, LockOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ConsultationSlotCalendar } from "@/components/consultation/consultation-slot-calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SlotStatus = "available" | "booked" | "blocked";

type AdminSlot = {
  time: string;
  status: SlotStatus;
  bookingId?: string;
  bookingName?: string;
  blockId?: string;
  reason?: string;
};

type AdminDay = {
  date: string;
  availableTimes: string[];
  slots: AdminSlot[];
};

function formatDisplayDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("bg-BG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function AdminConsultationAvailabilityPanel() {
  const [days, setDays] = useState<AdminDay[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingTime, setPendingTime] = useState<string | null>(null);

  const loadDays = useCallback(async () => {
    const res = await fetch("/api/admin/consultation-slots", { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Failed to load slots");
    }
    const data = (await res.json()) as { days: AdminDay[] };
    setDays(data.days ?? []);
    return data.days ?? [];
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const loaded = await loadDays();
        if (cancelled) return;
        const first =
          loaded.find((day) => day.slots.some((slot) => slot.status === "available")) ??
          loaded[0];
        if (first) setSelectedDate(first.date);
      } catch {
        if (!cancelled) toast.error("Неуспешно зареждане на календара");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadDays]);

  const selectedDay = useMemo(
    () => days.find((day) => day.date === selectedDate),
    [days, selectedDate],
  );

  const calendarDays = useMemo(
    () =>
      days.map((day) => ({
        date: day.date,
        // Keep every day selectable in admin, even when fully booked/locked.
        availableTimes:
          day.slots.length > 0 ? day.slots.map((slot) => slot.time) : ["10:00"],
      })),
    [days],
  );

  async function toggleSlot(slot: AdminSlot) {
    if (slot.status === "booked") {
      toast.message("Този час е зает от клиент", {
        description: slot.bookingName
          ? `${slot.bookingName} — премахнете записа от списъка с консултации, ако трябва.`
          : undefined,
      });
      return;
    }

    setPendingTime(slot.time);
    try {
      if (slot.status === "blocked") {
        const res = await fetch("/api/admin/consultation-slots", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: selectedDate, time: slot.time }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? "Unlock failed");
        }
        toast.success(`Отключен ${slot.time}`);
      } else {
        const res = await fetch("/api/admin/consultation-slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: selectedDate,
            time: slot.time,
            reason: reason.trim() || undefined,
          }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? "Lock failed");
        }
        toast.success(`Заключен ${slot.time}`, {
          description: "Без имейл и известия — само скрит за клиенти.",
        });
        setReason("");
      }
      await loadDays();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Неуспешна промяна на слота",
      );
    } finally {
      setPendingTime(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Зареждане на календара…
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <ConsultationSlotCalendar
        days={calendarDays}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <div className="space-y-5">
        <div>
          <h3 className="font-heading text-xl font-bold tracking-tight text-foreground">
            {selectedDate ? formatDisplayDate(selectedDate) : "Изберете ден"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Кликнете свободен час, за да го заключите за себе си. Заключените часове
            не изпращат имейли и не създават Meet — само не могат да се резервират от
            клиенти.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="block-reason">Бележка (по избор)</Label>
          <Input
            id="block-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="напр. фризьор, лична среща…"
            maxLength={200}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(selectedDay?.slots ?? []).map((slot) => {
            const isPending = pendingTime === slot.time;
            return (
              <Button
                key={slot.time}
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => void toggleSlot(slot)}
                className={cn(
                  "h-auto flex-col items-stretch gap-1 px-3 py-3 text-left",
                  slot.status === "available" &&
                    "border-border hover:border-primary/40",
                  slot.status === "blocked" &&
                    "border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100",
                  slot.status === "booked" &&
                    "cursor-default border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-50",
                )}
              >
                <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                  {slot.time}
                  {isPending ? (
                    <Loader2 className="size-3.5 shrink-0 animate-spin" />
                  ) : slot.status === "blocked" ? (
                    <Lock className="size-3.5 shrink-0" />
                  ) : slot.status === "available" ? (
                    <LockOpen className="size-3.5 shrink-0 opacity-50" />
                  ) : null}
                </span>
                <span className="text-xs font-normal opacity-80">
                  {slot.status === "available" && "Свободен — заключи"}
                  {slot.status === "blocked" &&
                    (slot.reason ? `Заключен: ${slot.reason}` : "Заключен — отключи")}
                  {slot.status === "booked" &&
                    (slot.bookingName
                      ? `Клиент: ${slot.bookingName}`
                      : "Зает от клиент")}
                </span>
              </Button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-background ring-1 ring-border" />
            Свободен
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-400" />
            Заключен от вас
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            Клиентска резервация
          </span>
        </div>
      </div>
    </div>
  );
}
