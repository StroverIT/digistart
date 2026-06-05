"use client";

import { useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { SitePreviewViewer } from "@/components/preview/site-preview-viewer";
import {
  resolveTemplatePreviewImageUrl,
  resolveTemplatePreviewUrl,
} from "@/lib/preview-url";
import {
  getNicheLabels,
  type StoreTemplate,
  type TemplateDetailSection,
} from "@/lib/data/templates";
import { trackCtaClick } from "@/lib/analytics/tracker";
import { setCheckoutTemplateSelection } from "@/lib/store/checkout-template";
import TransitionLink from "@/components/transitions/TransitionLink";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const livePreviewUrl = resolveTemplatePreviewUrl(template);
  const previewImageUrl = resolveTemplatePreviewImageUrl(template);
  const detailPath = template.demoPath;
  const goodForLabels = getNicheLabels(template.goodFor);
  const nicheTitle = goodForLabels[0] ?? template.name;

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
            <h1 className="text-2xl sm:text-3xl font-bold">{nicheTitle}</h1>
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

          <div className="flex flex-wrap gap-3">
            <TrackedCtaLink
              href="/services/online-store#buy-now"
              ctaId={`templates_detail_start_${template.category}_${template.id}`}
              onClick={() => {
                setCheckoutTemplateSelection({
                  category: template.category,
                  id: template.id,
                });
              }}
            >
              <Button type="button" size="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Започни с този шаблон
              </Button>
            </TrackedCtaLink>
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => {
                trackCtaClick(
                  detailPath,
                  `templates_detail_preview_${template.category}_${template.id}`,
                );
                setPreviewOpen(true);
              }}
            >
              <ExternalLink />
              Жив преглед
            </Button>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="relative w-full aspect-16/10 rounded-xl">
            <Image
              src={previewImageUrl}
              alt={`Преглед на ${nicheTitle}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain object-top"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 pt-4 border-t border-border">
        <DetailSection section={template.highlights} />
        <DetailSection section={template.navigation} />
      </div>

      <SitePreviewViewer
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        src={livePreviewUrl}
        title={nicheTitle}
        cta={
          <TrackedCtaLink
            href="/services/online-store#buy-now"
            ctaId={`templates_preview_choose_${template.category}_${template.id}`}
            onClick={() => {
              setCheckoutTemplateSelection({
                category: template.category,
                id: template.id,
              });
              setPreviewOpen(false);
            }}
          >
            <Button
              type="button"
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Избери този шаблон
            </Button>
          </TrackedCtaLink>
        }
      />
    </div>
  );
}
