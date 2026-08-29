"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { META_LEAD_VALUE, trackMetaLead } from "@/lib/analytics/meta-pixel";
import { trackAnalyticsEvent } from "@/lib/analytics/tracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  GOOGLE_FREE_ANALYSIS_SOURCE_DEFAULT,
  GOOGLE_FREE_ANALYSIS_URGENCY_OPTIONS,
  googleFreeAnalysisContent,
  googleFreeAnalysisFormFields,
  type GoogleFreeAnalysisUrgency,
} from "@/lib/data/google-free-analysis-content";
import { cn } from "@/lib/utils";

type LeadPayload = {
  name: string;
  email: string;
  phone: string;
  website: string;
  company: string;
  urgency: GoogleFreeAnalysisUrgency;
  source: string;
};

type FreeAnalysisFormProps = {
  /** Overrides `?source=` and the default source when set. */
  source?: string;
  /** Public POST endpoint. Default: `/api/google/free-analysis`. */
  apiPath?: string;
  metaContentName?: string;
  analyticsCtaId?: string;
  submitLabel?: string;
  consentText?: string;
  className?: string;
};

const inputClassName =
  "h-12 rounded-lg border border-border bg-white px-4 shadow-none focus-visible:ring-2 focus-visible:ring-accent/20";

export function FreeAnalysisForm({
  source: sourceProp,
  apiPath = "/api/google/free-analysis",
  metaContentName = "DigiStart - Безплатен Google анализ",
  analyticsCtaId = "google_free_analysis_submit",
  submitLabel,
  consentText,
  className,
}: FreeAnalysisFormProps = {}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const source =
    sourceProp?.trim() ||
    searchParams.get("source")?.trim() ||
    GOOGLE_FREE_ANALYSIS_SOURCE_DEFAULT;

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
      const response = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: payload.email.trim(),
          phone: payload.phone.trim(),
          website: payload.website.trim(),
          company: payload.company.trim(),
          urgency: payload.urgency,
          source: payload.source,
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
        content_name: metaContentName,
        page_path: pathname || apiPath,
        lead_source: payload.source,
        value: META_LEAD_VALUE.qualifiedForm,
        user: {
          email: payload.email.trim(),
          phone: payload.phone.trim(),
          firstName: trimmedName.split(/\s+/)[0],
          lastName: trimmedName.split(/\s+/).slice(1).join(" ") || undefined,
        },
      });
      trackAnalyticsEvent("cta_click", pathname || apiPath, {
        cta_id: analyticsCtaId,
        source: payload.source,
        urgency: payload.urgency,
      });

      if (data.alreadyRegistered) {
        toast.info("Вече имаме заявка с този имейл.");
      } else if (data.emailSent === false) {
        toast.success("Заявката е записана. Ще се свържем с теб скоро.");
      } else {
        toast.success("Готово! Ще получиш анализа на имейл.");
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
          {googleFreeAnalysisContent.formPage.successTitle}
        </h3>
        <p className="mt-3 text-base text-muted-foreground">
          {googleFreeAnalysisContent.formPage.successDescription}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-5", className)}>
      <div className="space-y-2">
        <Label htmlFor="analysis-name">{googleFreeAnalysisFormFields.name} *</Label>
        <Input
          id="analysis-name"
          value={payload.name}
          onChange={(event) => onChange("name", event.target.value)}
          autoComplete="name"
          className={inputClassName}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="analysis-email">{googleFreeAnalysisFormFields.email} *</Label>
        <Input
          id="analysis-email"
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
        <Label htmlFor="analysis-phone">{googleFreeAnalysisFormFields.phone} *</Label>
        <Input
          id="analysis-phone"
          value={payload.phone}
          onChange={(event) => onChange("phone", event.target.value)}
          autoComplete="tel"
          className={inputClassName}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="analysis-website">{googleFreeAnalysisFormFields.website} *</Label>
        <Input
          id="analysis-website"
          value={payload.website}
          onChange={(event) => onChange("website", event.target.value)}
          className={inputClassName}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="analysis-company">{googleFreeAnalysisFormFields.company} *</Label>
        <Input
          id="analysis-company"
          value={payload.company}
          onChange={(event) => onChange("company", event.target.value)}
          className={inputClassName}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-3">
        <Label>{googleFreeAnalysisFormFields.urgency} *</Label>
        <RadioGroup
          value={payload.urgency}
          onValueChange={(value) => onChange("urgency", value as GoogleFreeAnalysisUrgency)}
          className="grid grid-cols-1 gap-2 @xl:grid-cols-3"
        >
          {GOOGLE_FREE_ANALYSIS_URGENCY_OPTIONS.map((option) => (
            <Label
              key={option.value}
              className="flex min-w-0 cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-accent/40 @xl:flex-col @xl:items-center @xl:gap-2 @xl:px-3 @xl:py-4 @xl:text-center"
            >
              <RadioGroupItem value={option.value} className="shrink-0" />
              <span className="text-balance leading-snug">{option.label}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="h-14 w-full rounded-full bg-accent text-base font-semibold text-accent-foreground hover:bg-accent/90"
      >
        {loading
          ? "Изпращане..."
          : submitLabel ?? googleFreeAnalysisContent.formPage.submit}
        <ArrowUpRight className="ml-2 h-5 w-5" />
      </Button>

      {(consentText ?? googleFreeAnalysisContent.formPage.consent) ? (
        <p className="text-center text-xs leading-relaxed text-muted-foreground italic">
          {consentText ?? googleFreeAnalysisContent.formPage.consent}
        </p>
      ) : null}
    </form>
  );
}
