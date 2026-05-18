"use client";

import { ExternalLink } from "lucide-react";
import {
  getTemplateDetailPath,
  storeTemplates,
  type ProductCategory,
} from "@/lib/data/templates";
import { TemplatePreviewFrame } from "@/components/templates/template-preview-frame";
import { setCheckoutTemplateSelection, type CheckoutTemplateSelection } from "@/lib/store/checkout-template";
import { cn } from "@/lib/utils";

type CheckoutTemplatePickerProps = {
  value: CheckoutTemplateSelection | null;
  onChange: (selection: CheckoutTemplateSelection) => void;
};

export function CheckoutTemplatePicker({ value, onChange }: CheckoutTemplatePickerProps) {
  const handleSelect = (category: ProductCategory, id: string) => {
    const selection = { category, id };
    setCheckoutTemplateSelection(selection);
    onChange(selection);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Избери шаблон за онлайн магазина. Можеш да го прегледаш на живо преди да продължиш.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {storeTemplates.map((template) => {
          const selected = value?.category === template.category && value?.id === template.id;
          const detailPath = getTemplateDetailPath(template.category, template.id);

          return (
            <div
              key={`${template.category}-${template.id}`}
              className={cn(
                "rounded-xl border p-4 transition-all",
                selected
                  ? "border-primary ring-1 ring-primary/30 bg-primary/5"
                  : "border-border bg-card",
              )}
            >
              <button
                type="button"
                onClick={() => handleSelect(template.category, template.id)}
                className="w-full text-left"
              >
                <TemplatePreviewFrame template={template} size="thumb" className="mb-3" />
                <h3 className="font-semibold">{template.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {template.description}
                </p>
                <span className="mt-2 inline-block text-sm font-medium text-primary">
                  {selected ? "Избран" : "Избери"}
                </span>
              </button>
              <a
                href={detailPath}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
              >
                <ExternalLink className="h-3 w-3" />
                Виж детайли
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
