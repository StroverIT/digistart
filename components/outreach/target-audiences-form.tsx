"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { trackMetaLead } from "@/lib/analytics/meta-pixel";
import { trackAnalyticsEvent } from "@/lib/analytics/tracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  TARGET_AUDIENCES_SOURCE_DEFAULT,
  TARGET_AUDIENCES_URGENCY_OPTIONS,
  targetAudiencesContent,
  targetAudiencesFormFields,
  type TargetAudienceUrgency,
} from "@/lib/data/target-audiences-content";

type LeadPayload = {
  name: string;
  email: string;
  phone: string;
  website: string;
  company: string;
  urgency: TargetAudienceUrgency;
  source: string;
};

const inputClassName =
  "h-12 rounded-none border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:border-accent";

export function TargetAudiencesForm() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const source =
    searchParams.get("source")?.trim() || TARGET_AUDIENCES_SOURCE_DEFAULT;

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<LeadPayload>({
    name: "",
    email: "",
    phone: "",
    website: "",
    company: "",
    urgency: "today",
    source,
  });

  const onChange = (field: keyof LeadPayload, value: string) => {
    setPayload((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading || submitted) return;

    const trimmedName = payload.name.trim();
    if (trimmedName.length < 2) {
      toast.error("Моля, въведи две имена.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/target-audiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          name: trimmedName,
          email: payload.email.trim(),
          phone: payload.phone.trim(),
          website: payload.website.trim(),
          company: payload.company.trim(),
          pagePath: pathname,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        alreadyRegistered?: boolean;
        emailSent?: boolean;
        error?: string;
      };

      if (!response.ok) {
        toast.error(data.error ?? "Неуспешно изпращане.");
        return;
      }

      trackMetaLead({
        content_name: "DigiStart - 3 Потенциални целеви аудитории",
        page_path: pathname || "/target-audiences",
        lead_source: payload.source,
        user: {
          email: payload.email.trim(),
          phone: payload.phone.trim(),
          firstName: trimmedName.split(/\s+/)[0],
          lastName: trimmedName.split(/\s+/).slice(1).join(" ") || undefined,
        },
      });
      trackAnalyticsEvent("cta_click", "/target-audiences", {
        cta_id: "target_audiences_submit",
        source: payload.source,
        urgency: payload.urgency,
      });

      if (data.alreadyRegistered) {
        toast.info("Вече имаме заявка с този имейл.");
      } else if (data.emailSent === false) {
        toast.success("Заявката е записана. Ще се свържем с теб скоро.");
      } else {
        toast.success("Готово! Скоро ще получиш анализа на имейл.");
      }
      setSubmitted(true);
    } catch {
      toast.error("Възникна грешка. Опитай отново.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-3xl border border-primary/30 bg-primary/5 p-8 text-center">
        <h3 className="font-heading text-2xl font-bold text-foreground">
          {targetAudiencesContent.formPage.successTitle}
        </h3>
        <p className="mt-3 text-base text-muted-foreground">
          {targetAudiencesContent.formPage.successDescription}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="target-name">{targetAudiencesFormFields.name}</Label>
        <Input
          id="target-name"
          value={payload.name}
          onChange={(event) => onChange("name", event.target.value)}
          autoComplete="name"
          className={inputClassName}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="target-email">{targetAudiencesFormFields.email}</Label>
        <Input
          id="target-email"
          type="email"
          value={payload.email}
          onChange={(event) => onChange("email", event.target.value)}
          autoComplete="email"
          className={inputClassName}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="target-phone">{targetAudiencesFormFields.phone}</Label>
        <Input
          id="target-phone"
          value={payload.phone}
          onChange={(event) => onChange("phone", event.target.value)}
          autoComplete="tel"
          className={inputClassName}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="target-website">{targetAudiencesFormFields.website}</Label>
        <Input
          id="target-website"
          value={payload.website}
          onChange={(event) => onChange("website", event.target.value)}
          className={inputClassName}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="target-company">{targetAudiencesFormFields.company}</Label>
        <Input
          id="target-company"
          value={payload.company}
          onChange={(event) => onChange("company", event.target.value)}
          className={inputClassName}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-3">
        <Label>{targetAudiencesFormFields.urgency}</Label>
        <RadioGroup
          value={payload.urgency}
          onValueChange={(value) =>
            onChange("urgency", value as TargetAudienceUrgency)
          }
          className="grid grid-cols-1 gap-2 @xl:grid-cols-3"
        >
          {TARGET_AUDIENCES_URGENCY_OPTIONS.map((option) => (
            <Label
              key={option.value}
              className="flex min-w-0 cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-accent/40 @xl:flex-col @xl:items-center @xl:gap-2 @xl:px-3 @xl:py-4 @xl:text-center"
            >
              <RadioGroupItem value={option.value} />
              {option.label}
            </Label>
          ))}
        </RadioGroup>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="h-14 w-full rounded-full bg-foreground text-base font-semibold text-background hover:bg-foreground/90"
      >
        {loading ? "Изпращане..." : targetAudiencesContent.formPage.submit}
        <ArrowUpRight className="ml-2 h-5 w-5" />
      </Button>
    </form>
  );
}
