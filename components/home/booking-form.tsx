"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CalendarIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const SLOTS = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

function formatDate(d: Date) {
  return d.toLocaleDateString("bg-BG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function BookingForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || !phone || !email || !date || !slot) {
      toast.error("Моля попълни всички полета и избери час.");
      return;
    }
    toast.success("Заявката е получена!", {
      description: `Очаквай обаждане за ${formatDate(date)} в ${slot}.`,
    });
    setName("");
    setPhone("");
    setEmail("");
    setDate(undefined);
    setSlot(null);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <section id="booking" className="container mx-auto px-4 py-20 md:px-8 md:py-28">
      <div className="grid gap-10 rounded-[2.5rem] border border-border bg-card p-6 md:p-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            Безплатна консултация
          </span>
          <h2 className="mt-5 font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Запази своя час
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Попълни формата и нека обсъдим следващата стъпка за твоя бизнес.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-foreground">
            {[
              "30 минути разговор – без ангажимент",
              "Получаваш прозрачна оферта в рамките на 48 часа",
              "Реален човек на телефона, не бот",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-border bg-background p-6 md:p-8"
        >
          <div className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="name">Име и фамилия</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван Иванов"
                className="h-12"
              />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0888 123 456"
                  className="h-12"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Имейл</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ivan@example.com"
                  className="h-12"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Избери дата</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-12 justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? formatDate(date) : "Кликни и избери ден"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      setDate(d);
                      setSlot(null);
                      setOpen(false);
                    }}
                    disabled={(d) => d < today || d.getDay() === 0}
                    initialFocus
                    className={cn("pointer-events-auto p-3")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {date && (
              <div className="grid animate-in fade-in slide-in-from-top-2 gap-2">
                <Label>Свободни часове за {formatDate(date)}</Label>
                <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
                  {SLOTS.map((s) => {
                    const active = slot === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSlot(s)}
                        className={cn(
                          "h-11 rounded-xl border text-sm font-semibold transition-all",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:border-primary/40",
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="h-14 rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Потвърди консултацията
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
