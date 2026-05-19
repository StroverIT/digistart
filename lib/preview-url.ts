import { getTemplateRuntimeEntry } from "@/config/templates";
import type { StoreTemplate } from "@/lib/data/templates";

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, "");
}

export function resolveTemplatePreviewUrl(
  template: Pick<StoreTemplate, "category" | "id" | "previewPath">,
): string {
  const runtime = getTemplateRuntimeEntry(template.category, template.id);
  if (runtime?.previewOrigin) return normalizeUrl(runtime.previewOrigin);
  if (runtime?.previewPath) return runtime.previewPath;
  return template.previewPath;
}

export function resolveTemplatePreviewImageUrl(
  template: Pick<StoreTemplate, "category" | "id" | "previewImagePath">,
): string {
  return template.previewImagePath;
}

export function resolvePreviewPathBySlug(
  previewSlug: string,
  fallbackPath: string,
): string {
  const [category, id] = previewSlug.split("/");
  if (!category || !id) return fallbackPath;

  const runtime = getTemplateRuntimeEntry(category, id);
  if (runtime?.previewOrigin) return normalizeUrl(runtime.previewOrigin);
  if (runtime?.previewPath) return runtime.previewPath;

  return fallbackPath;
}
