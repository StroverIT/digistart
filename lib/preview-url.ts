import type { StoreTemplate } from "@/lib/data/templates";

/**
 * Direct origin for embedded preview (iframe / new tab).
 * Use when the template app does not set basePath (typical local dev).
 * Falls back to proxied previewPath when unset (production + template basePath).
 */
function getDirectPreviewOrigin(category: string, id: string): string | undefined {
  if (category === "clothing" && id === "1") {
    const fromPublic = process.env.NEXT_PUBLIC_TEMPLATE_CLOTHING_1_URL?.trim();
    if (fromPublic) return fromPublic.replace(/\/$/, "");

    if (typeof window === "undefined") {
      const fromServer = process.env.TEMPLATE_CLOTHING_1_URL?.trim();
      if (fromServer) return fromServer.replace(/\/$/, "");
    }
  }
  return undefined;
}

export function resolveTemplatePreviewUrl(
  template: Pick<StoreTemplate, "category" | "id" | "previewPath">,
): string {
  return getDirectPreviewOrigin(template.category, template.id) ?? template.previewPath;
}

export function resolvePreviewPathBySlug(
  previewSlug: string,
  fallbackPath: string,
): string {
  const [category, id] = previewSlug.split("/");
  if (category && id) {
    const direct = getDirectPreviewOrigin(category, id);
    if (direct) return direct;
  }
  return fallbackPath;
}
