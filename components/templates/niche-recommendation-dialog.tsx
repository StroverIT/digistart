"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Lightbulb, Loader2, Mail, Tag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackMetaLead } from "@/lib/analytics/meta-pixel";
import { cn } from "@/lib/utils";

type NicheRecommendationDialogProps = {
  triggerClassName?: string;
  variant?: "default" | "outline";
};

export function NicheRecommendationDialog({
  triggerClassName,
  variant = "outline",
}: NicheRecommendationDialogProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [niche, setNiche] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedNiche = niche.trim();
    const trimmedEmail = email.trim();

    if (!trimmedNiche) {
      toast.error("Моля, въведете ниша.");
      return;
    }
    if (!trimmedEmail) {
      toast.error("Моля, въведете имейл.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/niche-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: trimmedNiche, email: trimmedEmail }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        alreadySubscribed?: boolean;
        error?: string;
      };

      if (!res.ok) {
        toast.error(data.error ?? "Неуспешно записване.");
        return;
      }

      trackMetaLead({
        content_name: "DigiStart - Препоръка за ниша (шаблони)",
        page_path: pathname && pathname.length > 0 ? pathname : "/templates",
        lead_source: "template_niche_recommendation",
        user: { email: trimmedEmail },
      });

      toast.success(
        data.alreadySubscribed
          ? "Записахме препоръката ви! Ще ви уведомим, когато добавим тази ниша, и ще получите 10% отстъпка при старта ѝ."
          : "Благодарим! Ще ви напомним, когато създадем тази ниша, и ще получите 10% отстъпка при старта ѝ.",
      );

      setNiche("");
      setEmail("");
      setOpen(false);
    } catch {
      toast.error("Мрежова грешка. Опитайте отново.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant={variant} className={cn("gap-2", triggerClassName)}>
          <Lightbulb className="h-4 w-4" />
          Препоръчай ниша и вземи 10% намаление
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Препоръчай ниша</DialogTitle>
          <DialogDescription>
            Кажи ни коя ниша липсва. Ще те уведомим, когато я пуснем, и ще получиш 10% отстъпка при
            старта ѝ.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <IconField id="niche-recommendation" label="Ниша" icon={<Tag className="h-4 w-4" />}>
            <Input
              id="niche-recommendation"
              name="niche"
              placeholder="напр. Детски играчки, Спортни добавки..."
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              disabled={loading}
              autoComplete="off"
              className="pl-10"
            />
          </IconField>
          <IconField
            id="niche-recommendation-email"
            label="Имейл"
            icon={<Mail className="h-4 w-4" />}
          >
            <Input
              id="niche-recommendation-email"
              name="email"
              type="email"
              placeholder="имейл@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              className="pl-10"
            />
          </IconField>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="submit" className="w-full sm:w-auto glow-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Изпращане...
                </>
              ) : (
                "Изпрати препоръката"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function IconField({
  id,
  label,
  icon,
  children,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}
