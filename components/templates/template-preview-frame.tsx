"use client";

import { resolveTemplatePreviewUrl } from "@/lib/preview-url";
import type { StoreTemplate } from "@/lib/data/templates";
import { cn } from "@/lib/utils";

type TemplatePreviewFrameProps = {
  template: Pick<StoreTemplate, "category" | "id" | "previewPath" | "name">;
  size?: "thumb" | "detail";
  className?: string;
  lazy?: boolean;
};

const sizeClasses = {
  thumb: "aspect-4/3 w-full",
  detail: "aspect-16/10 w-full max-w-5xl",
} as const;

export function TemplatePreviewFrame({
  template,
  size = "thumb",
  className,
  lazy = true,
}: TemplatePreviewFrameProps) {
  const src = resolveTemplatePreviewUrl(template);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-muted/30",
        sizeClasses[size],
        className,
      )}
    >
      <iframe
        title={`Преглед на ${template.name}`}
        src={src}
        loading={lazy ? "lazy" : "eager"}
        className={cn(
          "h-full w-full border-0 bg-white",
          size === "thumb" && "pointer-events-none",
        )}
      />
    </div>
  );
}
