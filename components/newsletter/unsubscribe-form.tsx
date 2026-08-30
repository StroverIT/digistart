"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(() => searchParams.get("email")?.trim() ?? "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Моля, въведете имейл.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        alreadyUnsubscribed?: boolean;
        error?: string;
      };

      if (!res.ok) {
        toast.error(data.error ?? "Неуспешно отписване.");
        return;
      }

      setDone(true);
      if (data.alreadyUnsubscribed) {
        toast.info("Този имейл вече е отписан.");
      } else {
        toast.success("Отписахте се успешно. Няма да получавате повече имейли.");
      }
    } catch {
      toast.error("Мрежова грешка. Опитайте отново.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-card/80 p-6 text-center shadow-sm backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Отписани сте</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Имейлът <span className="font-medium text-foreground">{email.trim()}</span> няма да
          получава повече съобщения от DigiStart.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Отписване от имейли</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        Въведете имейла, с който сте записани, и няма да получавате повече съобщения от нас.
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Имейл..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 pl-10"
            disabled={loading}
            aria-label="Имейл за отписване"
            required
          />
        </div>
        <Button type="submit" size="lg" className="h-12 shrink-0 px-6" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Отписване...
            </>
          ) : (
            "Отпиши ме"
          )}
        </Button>
      </form>
    </div>
  );
}
