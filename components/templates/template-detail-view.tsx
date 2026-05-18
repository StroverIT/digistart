"use client";

import { useState } from "react";
import { ArrowLeft, ExternalLink, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreviewLink } from "@/components/preview/preview-link";
import { resolveTemplatePreviewUrl } from "@/lib/preview-url";
import type { StoreTemplate, TemplateDetailSection } from "@/lib/data/templates";
import { trackCtaClick } from "@/lib/analytics/tracker";
import { setCheckoutTemplateSelection } from "@/lib/store/checkout-template";
import TransitionLink from "@/components/transitions/TransitionLink";
import { cn } from "@/lib/utils";

type TemplateDetailViewProps = {
  template: StoreTemplate;
};

function DetailSection({ section }: { section: TemplateDetailSection }) {
  return (
    <section>
      <h3 className="text-lg font-semibold mb-3">{section.title}</h3>
      <ul className="space-y-2">
        {section.items.map((item) => (
          <li key={item} className="flex gap-3 text-muted-foreground text-sm leading-relaxed">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TemplateDetailView({ template }: TemplateDetailViewProps) {
  const previewUrl = resolveTemplatePreviewUrl(template);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const detailPath = template.demoPath;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <TransitionLink
          href="/templates"
          onClick={() => trackCtaClick(detailPath, "templates_detail_back")}
          className={cn(
            "inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent",
          )}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Към всички шаблони
        </TransitionLink>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{template.name}</h1>
            {template.tagline && (
              <p className="mt-2 text-primary font-medium">{template.tagline}</p>
            )}
            <p className="mt-3 text-muted-foreground leading-relaxed">{template.description}</p>
            {template.builtWith && (
              <p className="mt-4 text-sm text-muted-foreground border-l-2 border-primary/30 pl-4">
                {template.builtWith}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={device === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setDevice("desktop")}
            >
              <Monitor className="h-4 w-4 mr-2" />
              Desktop
            </Button>
            <Button
              type="button"
              variant={device === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setDevice("mobile")}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <PreviewLink
              href={previewUrl}
              ctaId={`templates_detail_preview_${template.category}_${template.id}`}
              ctaPage={detailPath}
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90",
              )}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Отвори на цял екран
            </PreviewLink>
            <TransitionLink
              href="/services/online-store#buy-now"
              onClick={() => {
                setCheckoutTemplateSelection({
                  category: template.category,
                  id: template.id,
                });
                trackCtaClick(detailPath, `templates_detail_start_${template.category}_${template.id}`);
              }}
            >
              <Button type="button" variant="secondary" size="default">
                Започни с този шаблон
              </Button>
            </TransitionLink>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div
            className={cn(
              "overflow-hidden rounded-xl border border-border bg-muted/30 shadow-2xl transition-all duration-300",
              device === "desktop" ? "w-full aspect-16/10" : "w-[375px] aspect-9/19",
            )}
          >
            <iframe
              title={`Преглед на ${template.name}`}
              src={previewUrl}
              className="h-full w-full border-0 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 pt-4 border-t border-border">
        <DetailSection section={template.audience} />
        <DetailSection section={template.highlights} />
        <DetailSection section={template.navigation} />
      </div>
    </div>
  );
}
