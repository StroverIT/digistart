"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackMetaLead } from "@/lib/analytics/meta-pixel";

type NewsletterSignupFormProps = {
  spotsRemaining: number;
  totalSpots: number;
};

export function NewsletterSignupForm({ spotsRemaining, totalSpots }: NewsletterSignupFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isFull = spotsRemaining <= 0;
  const disabled = loading || isFull;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isFull) return;

    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Моля, въведете имейл.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        alreadySubscribed?: boolean;
        emailSent?: boolean;
        error?: string;
      };

      if (res.status === 403) {
        toast.error(data.error ?? "Няма свободни места.");
        router.refresh();
        return;
      }

      if (!res.ok) {
        toast.error(data.error ?? "Неуспешно записване.");
        return;
      }

      if (data.alreadySubscribed) {
        toast.info("Вече сте записани за бюлетина с този имейл.");
        return;
      }

      trackMetaLead({
        content_name: "DigiStart — Бюлетин (очаквайте скоро)",
        page_path: pathname && pathname.length > 0 ? pathname : "/",
        lead_source: "coming_soon_newsletter",
      });

      if (data.emailSent === false) {
        toast.success(
          "Записахте се успешно! Имейлът за потвърждение може да закъснее — проверете настройките за изпращане.",
        );
      } else {
        toast.success("Благодарим! Проверете пощата си за потвърждение.");
      }
      setEmail("");
      router.refresh();
    } catch {
      toast.error("Мрежова грешка. Опитайте отново.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 w-full rounded-2xl border border-border bg-card/80 p-5 text-left shadow-sm backdrop-blur">
      {isFull ? (
        <p className="text-center text-sm font-medium text-muted-foreground">
          Всички места са заети. Благодарим за интереса!
        </p>
      ) : (
        <>
          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
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
                disabled={disabled}
                aria-label="Имейл за записване в списъка"
              />
            </div>
            <Button type="submit" size="lg" className="glow-primary h-12 shrink-0 px-6" disabled={disabled}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Изпращане...
                </>
              ) : (
                "Запази ми място и 10% отстъпка 👇"
              )}
            </Button>
          </form>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Остават само {spotsRemaining} места. Записването не те задължава да плащаш нищо.
          </p>
        </>
      )}
    </div>
  );
}
