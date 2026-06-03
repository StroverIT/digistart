"use client";

import { getTemplateDetailPath, type StoreTemplate } from "@/lib/data/templates";
import { TemplatePreviewFrame } from "@/components/templates/template-preview-frame";
import { trackCtaClick } from "@/lib/analytics/tracker";
import TransitionLink from "@/components/transitions/TransitionLink";
import { cn } from "@/lib/utils";

type TemplateCardProps = {
  template: StoreTemplate;
  className?: string;
};

export function TemplateCard({ template, className }: TemplateCardProps) {
  const href = getTemplateDetailPath(template.category, template.id);

  return (
    <TransitionLink
      href={href}
      onClick={() =>
        trackCtaClick("/templates", `templates_select_${template.category}_${template.id}`)
      }
      className={cn(
        "group block w-full rounded-xl p-4 text-left transition-all",
        "hover:scale-110",
        className,
      )}
    >
      <TemplatePreviewFrame template={template} size="thumb" className="mb-4" />
    </TransitionLink>
  );
}
