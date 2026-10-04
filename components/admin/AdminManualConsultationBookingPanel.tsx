"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ConsultationSlotCalendar } from "@/components/consultation/consultation-slot-calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export function AdminManualConsultationBookingPanel() {
  const [days, setDays] = useState<AdminDay[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    setSelectedTime("");
  }, [selectedDate]);

  const selectedDay = useMemo(
    () => days.find((day) => day.date === selectedDate),
    [days, selectedDate],
  );

  const calendarDays = useMemo(
    () =>
      days.map((day) => ({
        date: day.date,
        availableTimes: day.slots
          .filter((slot) => slot.status === "available")
          .map((slot) => slot.time),
      })),
    [days],
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!selectedDate || !selectedTime) {
      toast.error("Изберете ден и час");
      return;
    }
    if (name.trim().length < 2) {
      toast.error("Въведете име (поне 2 символа)");
      return;
    }
    if (!email.trim().includes("@")) {
      toast.error("Въведете валиден имейл");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/consultations/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          notes: notes.trim() || undefined,
          date: selectedDate,
          time: selectedTime,
          meetingType: "online",
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | {
            error?: string;
            booking?: { meetUrl?: string; calendarUrl?: string; id: string };
          }
        | null;

      if (!res.ok) {
        throw new Error(data?.error ?? "Резервацията не успя");
      }

      toast.success(`Запазано: ${name.trim()} · ${selectedDate} ${selectedTime}`, {
        description: data?.booking?.meetUrl
          ? "Календар + Meet + имейл към клиента са изпратени."
          : "Календар и имейл към клиента са изпратени.",
      });

      setName("");
      setEmail("");
      setPhone("");
      setNotes("");
      setSelectedTime("");
      await loadDays();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Неуспешна резервация");
    } finally {
      setSubmitting(false);
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
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
    >
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
            Ръчна резервация: избирате свободен час, въвеждате име и имейл. Създава
            Google Calendar събитие и изпраща потвърждение на клиента.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(selectedDay?.slots ?? []).map((slot) => {
            const isSelected = selectedTime === slot.time;
            const isDisabled = slot.status !== "available" || submitting;
            return (
              <Button
                key={slot.time}
                type="button"
                variant="outline"
                disabled={isDisabled}
                onClick={() => setSelectedTime(slot.time)}
                className={cn(
                  "h-auto flex-col items-stretch gap-1 px-3 py-3 text-left",
                  slot.status === "available" &&
                    !isSelected &&
                    "border-border hover:border-primary/40",
                  isSelected &&
                    "border-primary bg-primary/5 text-foreground ring-1 ring-primary/30",
                  slot.status === "blocked" &&
                    "border-amber-200 bg-amber-50/60 text-amber-900/70",
                  slot.status === "booked" &&
                    "border-emerald-200 bg-emerald-50/60 text-emerald-900/70",
                )}
              >
                <span className="text-sm font-semibold">{slot.time}</span>
                <span className="text-xs font-normal opacity-80">
                  {slot.status === "available" && (isSelected ? "Избран" : "Свободен")}
                  {slot.status === "blocked" &&
                    (slot.reason ? `Заключен: ${slot.reason}` : "Заключен")}
                  {slot.status === "booked" &&
                    (slot.bookingName ? `Клиент: ${slot.bookingName}` : "Зает")}
                </span>
              </Button>
            );
          })}
        </div>

        <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
          <div className="space-y-2">
            <Label htmlFor="manual-booking-name">Име *</Label>
            <Input
              id="manual-booking-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Име на клиента"
              required
              minLength={2}
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manual-booking-email">Имейл *</Label>
            <Input
              id="manual-booking-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="client@email.com"
              required
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manual-booking-phone">Телефон (по избор)</Label>
            <Input
              id="manual-booking-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="089…"
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manual-booking-notes">Бележка (по избор)</Label>
            <Textarea
              id="manual-booking-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Контекст от обаждане / чат…"
              rows={3}
              maxLength={2000}
              disabled={submitting}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting || !selectedDate || !selectedTime}
          className="w-full sm:w-auto"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Запазване…
            </>
          ) : (
            <>
              <CalendarPlus className="size-4" />
              Запази и изпрати имейл
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          Източникът в списъка ще е „Админ — ръчна“. Създава Meet + календар и
          праща същия тип потвърждение като публичната форма.
        </p>
      </div>
    </form>
  );
}
