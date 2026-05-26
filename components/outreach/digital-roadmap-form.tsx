"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { trackMetaLead } from "@/lib/analytics/meta-pixel";
import { trackAnalyticsEvent } from "@/lib/analytics/tracker";

export function DigitalRoadmapForm() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const source = searchParams.get("source")?.trim() || "digital-roadmap";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitted) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (trimmedName.length < 2) {
      toast.error("Моля, въведете две имена.");
      return;
    }
    if (!trimmedEmail) {
      toast.error("Моля, въведете имейл.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/digital-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          source,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        alreadyRegistered?: boolean;
        emailSent?: boolean;
        error?: string;
      };

      if (!res.ok) {
        toast.error(data.error ?? "Неуспешно записване.");
        return;
      }

      if (data.alreadyRegistered) {
        toast.info("Вече сте заявили ръководството с този имейл.");
        setSubmitted(true);
        return;
      }

      trackMetaLead({
        content_name: "DigiStart - Дигитална пътна карта (PDF)",
        page_path: pathname && pathname.length > 0 ? pathname : "/digital-roadmap",
        lead_source: source,
        user: { email: trimmedEmail },
      });

      trackAnalyticsEvent("cta_click", "/digital-roadmap", {
        cta_id: "digital_roadmap_submit",
        source,
      });

      if (data.emailSent === false) {
        toast.success("Записахме ви! Ще получите имейл, когато изпратим ръководството.");
      } else {
        toast.success("Записахме ви! Проверете пощата си за потвърждение.");
      }
      setSubmitted(true);
    } catch {
      toast.error("Възникна грешка. Моля, опитайте отново.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-bold mb-3">Благодарим ви!</h2>
          <p className="text-muted-foreground leading-relaxed">
            Ръководството вече е създадено и го подобряваме. Ще ви изпратим финалния PDF на
            посочения имейл, веднага щом е готов.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="roadmap-name">Две имена</Label>
            <Input
              id="roadmap-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван Иванов"
              autoComplete="name"
              required
              minLength={2}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roadmap-email">Имейл</Label>
            <Input
              id="roadmap-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ivan@example.com"
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full glow-primary" size="lg" disabled={loading}>
            {loading ? "Записване..." : "Изпрати ми ръководството"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Без спам. Можете да се отпишете по всяко време.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
