"use client";

import Image from "next/image";
import { resolveTemplatePreviewImageUrl } from "@/lib/preview-url";
import type { StoreTemplate } from "@/lib/data/templates";
import { cn } from "@/lib/utils";

type TemplatePreviewFrameProps = {
  template: Pick<StoreTemplate, "category" | "id" | "previewImagePath" | "name">;
  size?: "thumb" | "detail";
  className?: string;
  priority?: boolean;
};

const sizeClasses = {
  thumb: "aspect-4/3 w-full",
  detail: "aspect-16/10 w-full max-w-5xl",
} as const;

const imageSizes = {
  thumb: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  detail: "(max-width: 1024px) 100vw, 50vw",
} as const;

export function TemplatePreviewFrame({
  template,
  size = "thumb",
  className,
  priority = false,
}: TemplatePreviewFrameProps) {
  const src = resolveTemplatePreviewImageUrl(template);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg",
        sizeClasses[size],
        className,
      )}
    >
      <Image
        src={src}
        alt={`Преглед на ${template.name}`}
        fill
        priority={priority}
        sizes={imageSizes[size]}
        className="object-contain object-top"
      />
    </div>
  );
}
