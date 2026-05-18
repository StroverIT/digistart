"use client";

import type { StoreTemplate } from "@/lib/data/templates";
import { TemplatePreviewFrame } from "@/components/templates/template-preview-frame";
import { cn } from "@/lib/utils";

type TemplateCardProps = {
  template: StoreTemplate;
  onSelect: (template: StoreTemplate) => void;
  className?: string;
};

export function TemplateCard({ template, onSelect, className }: TemplateCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      className={cn(
        "group w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all",
        "hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
    >
      <TemplatePreviewFrame template={template} size="thumb" className="mb-4" />
      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
        {template.name}
      </h3>
      {template.tagline && (
        <p className="mt-1 text-sm text-primary/90">{template.tagline}</p>
      )}
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{template.description}</p>
      <span className="mt-3 inline-block text-sm font-medium text-primary">
        Виж подробности →
      </span>
    </button>
  );
}
