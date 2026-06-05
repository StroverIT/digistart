"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SitePreviewViewer } from "@/components/preview/site-preview-viewer";
import { TemplatePreviewFrame } from "@/components/templates/template-preview-frame";
import { trackCtaClick } from "@/lib/analytics/tracker";
import { getNicheLabels, type StoreTemplate } from "@/lib/data/templates";
import { resolveTemplatePreviewUrl } from "@/lib/preview-url";
import { cn } from "@/lib/utils";

function templateNicheTitle(template: StoreTemplate): string {
  const labels = getNicheLabels(template.goodFor);
  return labels.length > 0 ? labels.join(" · ") : template.name;
}

type OnboardingTemplatePickerProps = {
  templates: StoreTemplate[];
  selectedIds: string[];
  saving: boolean;
  onToggle: (id: string) => void;
};

export function OnboardingTemplatePicker({
  templates,
  selectedIds,
  saving,
  onToggle,
}: OnboardingTemplatePickerProps) {
  const [previewTemplate, setPreviewTemplate] = useState<StoreTemplate | null>(null);

  const openPreview = (template: StoreTemplate) => {
    trackCtaClick("/onboarding", `onboarding_preview_${template.category}_${template.id}`);
    setPreviewTemplate(template);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            Изберете всички категории, които описват вашите продукти. Можете да маркирате повече
            от една (напр. дрехи и обувки).
          </p>
          {selectedIds.length > 0 ? (
            <p className="font-medium text-foreground">
              Избрани: {selectedIds.length}
            </p>
          ) : null}
          <p>
            Не намирате вашата категория? След онбординга ни пишете в{" "}
            <span className="text-primary">чата в клиентския панел</span>
            .
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {templates.map((template) => {
            const selected = selectedIds.includes(template.id);
            const nicheTitle = templateNicheTitle(template);

            return (
              <div
                key={`${template.category}-${template.id}`}
                className={cn(
                  "flex flex-col rounded-xl border p-4 transition-all",
                  selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border bg-card",
                )}
              >
                <TemplatePreviewFrame template={template} size="thumb" className="mb-3" />

                <h3 className="font-semibold">{nicheTitle}</h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={saving}
                    onClick={() => openPreview(template)}
                  >
                    <Eye className="size-4" />
                    Преглед
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={selected ? "default" : "outline"}
                    disabled={saving}
                    onClick={() => onToggle(template.id)}
                  >
                    {selected ? "Избрана" : "Избери"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {previewTemplate ? (
        <SitePreviewViewer
          open={Boolean(previewTemplate)}
          onOpenChange={(open) => {
            if (!open) setPreviewTemplate(null);
          }}
          src={resolveTemplatePreviewUrl(previewTemplate)}
          title={templateNicheTitle(previewTemplate)}
          cta={
            <Button
              type="button"
              size="sm"
              disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                onToggle(previewTemplate.id);
              }}
            >
              {selectedIds.includes(previewTemplate.id) ? "Премахни от избраните" : "Добави към избраните"}
            </Button>
          }
        />
      ) : null}
    </>
  );
}
