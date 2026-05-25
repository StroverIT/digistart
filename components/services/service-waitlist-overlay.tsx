"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ServiceSlotAvailability } from "@/lib/types";

interface ServiceWaitlistOverlayProps {
  availability: ServiceSlotAvailability;
}

export function ServiceWaitlistOverlay({ availability }: ServiceWaitlistOverlayProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Моля, въведете две имена.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/service-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          serviceId: availability.serviceId,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(data.error ?? "Неуспешно записване. Опитайте отново.");
        return;
      }
      toast.success("Записахме те в списъка с чакащи. Ще се свържем с 10% отстъпка.");
      setName("");
      setEmail("");
    } catch {
      toast.error("Неуспешно записване. Опитайте отново.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background/95 p-5 shadow-xl backdrop-blur-sm sm:p-6">
        <h3 className="text-lg font-bold text-foreground sm:text-xl">
          Местата приключиха
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Може да се запишеш по-рано и да получиш{" "}
          <span className="font-semibold text-primary">10% отстъпка</span>, когато
          отворим нови места за {availability.serviceName}.
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="waitlist-name">Две имена</Label>
            <Input
              id="waitlist-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван Иванов"
              autoComplete="name"
              required
              minLength={2}
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="waitlist-email">Имейл</Label>
            <Input
              id="waitlist-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ivan@example.com"
              autoComplete="email"
              required
              disabled={submitting}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? "Записване..." : "Запиши ме в списъка"}
          </Button>
        </form>
      </div>
    </div>
  );
}
