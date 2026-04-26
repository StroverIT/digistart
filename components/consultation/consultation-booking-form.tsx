"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  title?: string;
  description?: string;
  submitLabel?: string;
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

function formatDisplayDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("bg-BG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function ConsultationBookingForm({
  source,
  title = "Запазете безплатна консултация",
  description = "Изберете удобен ден и час, попълнете контактни данни и ще потвърдим срещата веднага.",
  submitLabel = "Запази консултация",
  initialValues,
  orderId,
  onBooked,
}: Props) {
  const [days, setDays] = useState<SlotDay[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  useEffect(() => {
    if (!selectedDate) return;
    if (!availableTimes.includes(selectedTime)) {
      setSelectedTime(availableTimes[0] ?? "");
    }
  }, [availableTimes, selectedDate, selectedTime]);

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
      setSuccess("Консултацията е запазена успешно.");
      onBooked?.(booking);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Неуспешно запазване.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        {isLoadingSlots ? (
          <div className="py-10 flex items-center justify-center">
            <div className="animate-spin h-7 w-7 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Изберете ден</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {days.map((day) => (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDate(day.date)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm transition-colors",
                      selectedDate === day.date
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/40",
                      day.availableTimes.length === 0 && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={day.availableTimes.length === 0}
                  >
                    {formatDisplayDate(day.date)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Изберете час</p>
              <div className="flex flex-wrap gap-2">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-sm transition-colors",
                      selectedTime === time
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    {time}
                  </button>
                ))}
                {availableTimes.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Няма свободни часове за избрания ден.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                name="name"
                value={formData.name}
                onChange={onInputChange}
                placeholder="Име и фамилия"
                required
              />
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
              <Input
                name="company"
                value={formData.company}
                onChange={onInputChange}
                placeholder="Фирма (по избор)"
              />
            </div>

            <Textarea
              name="notes"
              value={formData.notes}
              onChange={onInputChange}
              placeholder="Допълнителни бележки (по избор)"
              rows={3}
            />

            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            {success ? <p className="text-sm text-green-600">{success}</p> : null}

            <Button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={
                isSubmitting ||
                !selectedDate ||
                !selectedTime ||
                availableTimes.length === 0
              }
              className="w-full"
            >
              {isSubmitting ? "Запазване..." : submitLabel}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
