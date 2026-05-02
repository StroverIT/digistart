"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackMetaLead } from "@/lib/analytics/meta-pixel";

const COPY =
  "🎁 Готов ли си за дигитален скок? Остави имейла си сега и бъди сред първите, които ще научат за старта ни. Като бонус получаваш 10% ексклузивна отстъпка за първата си услуга при нас!";

export function NewsletterSignupForm() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
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
        toast.success("Записахте се успешно! Имейлът за потвърждение може да закъснее — проверете настройките за изпращане.");
      } else {
        toast.success("Благодарим! Проверете пощата си за потвърждение.");
      }
      setEmail("");
    } catch {
      toast.error("Мрежова грешка. Опитайте отново.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2 w-full max-w-xl rounded-2xl border border-border bg-card/80 p-5 text-left shadow-sm backdrop-blur lg:mx-0">
      <p className="text-sm font-semibold leading-relaxed text-foreground sm:text-[0.9375rem]">{COPY}</p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="твоят@имейл.bg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 pl-10"
            disabled={loading}
            aria-label="Имейл за бюлетин"
          />
        </div>
        <Button type="submit" size="lg" className="glow-primary h-12 shrink-0 px-6" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Изпращане...
            </>
          ) : (
            "Искам отстъпката"
          )}
        </Button>
      </form>
    </div>
  );
}
