"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { flushAnalyticsEventsAsync, trackAnalyticsEvent } from "@/lib/analytics/tracker";

type SlotDay = {
  date: string;
  availableTimes: string[];
};

type BookedPayload = {
  id: string;
  date: string;
  time: string;
  source: "public" | "checkout";
  status: "scheduled";
  orderId?: string;
};

type Props = {
  source: "public" | "checkout";
  variant?: "card" | "embedded";
  className?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
  showCompanyField?: boolean;
  showNotesField?: boolean;
  analyticsPath?: string;
  analyticsCtaId?: string;
  initialValues?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    notes?: string;
  };
  orderId?: string;
  onBooked?: (booking: BookedPayload) => void;
};

function formatDisplayDate(value: string, variant: "card" | "embedded") {
  const options: Intl.DateTimeFormatOptions =
    variant === "embedded"
      ? { weekday: "long", day: "numeric", month: "long" }
      : { weekday: "short", day: "numeric", month: "short" };

  return new Date(`${value}T00:00:00`).toLocaleDateString("bg-BG", options);
}

export default function ConsultationBookingForm({
  source,
  variant = "card",
  className,
  title = "Запазете безплатна консултация",
  description = "Изберете удобен ден и час, попълнете контактни данни и ще потвърдим срещата веднага.",
  submitLabel = "Запази консултация",
  showCompanyField = true,
  showNotesField = true,
  analyticsPath = "/consultation",
  analyticsCtaId,
  initialValues,
  orderId,
  onBooked,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const isEmbedded = variant === "embedded";
  const [days, setDays] = useState<SlotDay[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [locallyDisabledSlots, setLocallyDisabledSlots] = useState<Record<string, Set<string>>>({});

  const [formData, setFormData] = useState({
    name: initialValues?.name ?? "",
    email: initialValues?.email ?? "",
    phone: initialValues?.phone ?? "",
    company: initialValues?.company ?? "",
    notes: initialValues?.notes ?? "",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: initialValues?.name ?? prev.name,
      email: initialValues?.email ?? prev.email,
      phone: initialValues?.phone ?? prev.phone,
      company: initialValues?.company ?? prev.company,
      notes: initialValues?.notes ?? prev.notes,
    }));
  }, [initialValues]);

  useEffect(() => {
    const loadSlots = async () => {
      setIsLoadingSlots(true);
      setError("");
      try {
        const res = await fetch("/api/consultation/slots", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load slots");
        const data = await res.json();
        const loadedDays = (data.days ?? []) as SlotDay[];
        setDays(loadedDays);

        const firstWithAvailability = loadedDays.find((day) => day.availableTimes.length > 0);
        if (firstWithAvailability) {
          setSelectedDate(firstWithAvailability.date);
          setSelectedTime(firstWithAvailability.availableTimes[0] ?? "");
        }
      } catch {
        setError("Не успяхме да заредим часовете. Моля опитайте отново.");
      } finally {
        setIsLoadingSlots(false);
      }
    };

    void loadSlots();
  }, []);

  const availableTimes = useMemo(() => {
    return days.find((day) => day.date === selectedDate)?.availableTimes ?? [];
  }, [days, selectedDate]);

  const isTimeLocallyDisabled = (date: string, time: string) =>
    locallyDisabledSlots[date]?.has(time) ?? false;

  useEffect(() => {
    if (!selectedDate) return;
    if (!availableTimes.includes(selectedTime) || isTimeLocallyDisabled(selectedDate, selectedTime)) {
      const firstEnabledTime = availableTimes.find((time) => !isTimeLocallyDisabled(selectedDate, time));
      setSelectedTime(firstEnabledTime ?? "");
    }
  }, [availableTimes, selectedDate, selectedTime, locallyDisabledSlots]);

  useEffect(() => {
    if (isLoadingSlots) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const els = root.querySelectorAll<HTMLElement>("[data-consult-animate]");
      if (!els.length) return;
      gsap.set(els, { opacity: 0, y: 28 });
      gsap.to(els, {
        opacity: 1,
        y: 0,
        duration: 0.48,
        stagger: 0.09,
        ease: "back.out(1.3)",
      });
    }, root);

    return () => ctx.revert();
  }, [isLoadingSlots]);

  useEffect(() => {
    if (!success) return;
    const root = rootRef.current;
    if (!root) return;
    const msg = root.querySelector<HTMLElement>("[data-consult-success]");
    if (!msg) return;
    gsap.fromTo(msg, { opacity: 0, y: 12, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.4)" });
  }, [success]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/consultation/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          date: selectedDate,
          time: selectedTime,
          source,
          orderId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Booking failed");
      }

      const booking = data.booking as BookedPayload;
      trackAnalyticsEvent("cta_click", analyticsPath, {
        cta_id:
          analyticsCtaId ??
          (source === "checkout" ? "checkout_consultation_submit" : "consultation_submit"),
      });
      await flushAnalyticsEventsAsync();
      setSuccess("Консултацията е запазена успешно.");
      setLocallyDisabledSlots((prev) => {
        const next = { ...prev };
        const dateSlots = new Set(next[booking.date] ?? []);
        dateSlots.add(booking.time);
        next[booking.date] = dateSlots;
        return next;
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        notes: "",
      });
      onBooked?.(booking);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Неуспешно запазване.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dayButtonClass = (day: SlotDay) =>
    cn(
      "text-sm font-semibold transition-all",
      isEmbedded ? "h-11 rounded-xl px-3" : "rounded-md border px-3 py-2",
      isEmbedded
        ? selectedDate === day.date
          ? "bg-accent text-accent-foreground shadow-md"
          : "bg-background/80 text-foreground hover:bg-background"
        : selectedDate === day.date
          ? "border-primary bg-primary/10 text-primary"
          : "border-border hover:border-primary/40",
      !isEmbedded && "border",
      day.availableTimes.length === 0 && "cursor-not-allowed opacity-50",
    );

  const timeButtonClass = (time: string) =>
    cn(
      "text-sm font-semibold transition-all",
      isEmbedded ? "h-11 rounded-xl px-3" : "rounded-md px-3 py-1.5",
      isEmbedded
        ? selectedTime === time
          ? "bg-accent text-accent-foreground shadow-md"
          : "bg-background/80 text-foreground hover:bg-background"
        : selectedTime === time
          ? "border-primary bg-primary/10 text-primary"
          : "border-border hover:border-primary/40",
      !isEmbedded && "border",
      isTimeLocallyDisabled(selectedDate, time) &&
        "cursor-not-allowed opacity-50 line-through hover:border-border",
    );

  const embeddedInputClass =
    "h-12 border-0 bg-background shadow-sm ring-1 ring-foreground/[0.06] focus-visible:ring-accent/30";

  const formContent = isLoadingSlots ? (
    <div className="flex items-center justify-center py-10">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  ) : (
    <div className={cn(isEmbedded ? "grid gap-5" : "space-y-6")}>
      <div
        data-consult-animate
        className={cn("space-y-2 opacity-0 translate-y-10", isEmbedded && "order-3")}
      >
        {isEmbedded ? (
          <Label>Избери ден</Label>
        ) : (
          <p className="text-sm font-medium">Изберете ден</p>
        )}
        <div className={cn("grid gap-2", isEmbedded ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 sm:grid-cols-3")}>
          {days.map((day) => (
            <button
              key={day.date}
              type="button"
              onClick={() => setSelectedDate(day.date)}
              className={dayButtonClass(day)}
              disabled={day.availableTimes.length === 0}
            >
              {formatDisplayDate(day.date, variant)}
            </button>
          ))}
        </div>
      </div>

      <div
        data-consult-animate
        className={cn("space-y-2 opacity-0 translate-y-10", isEmbedded && "order-4")}
      >
        {isEmbedded ? (
          <Label>
            {selectedDate
              ? `Свободни часове за ${formatDisplayDate(selectedDate, variant)}`
              : "Избери час"}
          </Label>
        ) : (
          <p className="text-sm font-medium">Изберете час</p>
        )}
        <div className={cn(isEmbedded ? "grid grid-cols-3 gap-2 md:grid-cols-4" : "flex flex-wrap gap-2")}>
          {availableTimes.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setSelectedTime(time)}
              className={timeButtonClass(time)}
              disabled={isTimeLocallyDisabled(selectedDate, time)}
            >
              {time}
            </button>
          ))}
          {availableTimes.length === 0 && (
            <p className="text-sm text-muted-foreground">Няма свободни часове за избрания ден.</p>
          )}
        </div>
      </div>

      <div
        data-consult-animate
        className={cn(
          "opacity-0 translate-y-10",
          isEmbedded ? "order-1 grid gap-5" : "grid grid-cols-1 gap-4 sm:grid-cols-2",
        )}
      >
        {isEmbedded ? (
          <div className="grid gap-2">
            <Label htmlFor="consult-name">Име и фамилия</Label>
            <Input
              id="consult-name"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              placeholder="Иван Иванов"
              className={cn(isEmbedded ? embeddedInputClass : undefined, "h-12")}
              required
            />
          </div>
        ) : (
          <Input
            name="name"
            value={formData.name}
            onChange={onInputChange}
            placeholder="Име и фамилия"
            required
          />
        )}

        {isEmbedded ? (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="consult-phone">Телефон</Label>
              <Input
                id="consult-phone"
                name="phone"
                value={formData.phone}
                onChange={onInputChange}
                placeholder="0888 123 456"
                className={cn(isEmbedded ? embeddedInputClass : undefined, "h-12")}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="consult-email">Имейл</Label>
              <Input
                id="consult-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={onInputChange}
                placeholder="ivan@example.com"
                className={cn(isEmbedded ? embeddedInputClass : undefined, "h-12")}
                required
              />
            </div>
          </div>
        ) : (
          <>
            <Input
              name="phone"
              value={formData.phone}
              onChange={onInputChange}
              placeholder="Телефон"
              required
            />
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={onInputChange}
              placeholder="Имейл"
              required
            />
            {showCompanyField ? (
              <Input
                name="company"
                value={formData.company}
                onChange={onInputChange}
                placeholder="Фирма (по избор)"
              />
            ) : null}
          </>
        )}
      </div>

      {!isEmbedded && showNotesField ? (
        <div data-consult-animate className="opacity-0 translate-y-10">
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={onInputChange}
            placeholder="Допълнителни бележки (по избор)"
            rows={3}
          />
        </div>
      ) : null}

      {error ? <p className={cn("text-sm text-red-500", isEmbedded && "order-5")}>{error}</p> : null}
      {success ? (
        <p data-consult-success className={cn("text-sm text-green-600", isEmbedded && "order-6")}>
          {success}
        </p>
      ) : null}

      <div data-consult-animate className={cn("opacity-0 translate-y-10", isEmbedded && "order-7")}>
        <Button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={
            isSubmitting ||
            !selectedDate ||
            !selectedTime ||
            availableTimes.length === 0 ||
            isTimeLocallyDisabled(selectedDate, selectedTime)
          }
          className={cn(
            "w-full",
            isEmbedded &&
              "h-14 rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90",
          )}
        >
          {isSubmitting ? "Запазване..." : submitLabel}
        </Button>
      </div>
    </div>
  );

  if (isEmbedded) {
    return (
      <div ref={rootRef} className={className}>
        {formContent}
      </div>
    );
  }

  return (
    <Card ref={rootRef} className={cn("border-border bg-card", className)}>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}
