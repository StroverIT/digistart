import type { TemplateRuntimeEntry, TemplatesConfig } from "./templates.types";

/**
 * Shared local / staging template URLs for all developers.
 * Template 1 uses localhost; 2–8 use deployed Vercel previews (same as production).
 */
const vercelClothing = (
  id: string,
  rewriteTarget: string,
): TemplateRuntimeEntry => ({
  previewPath: `/preview/clothing/${id}`,
  rewriteTarget,
  previewOrigin: rewriteTarget,
});

export const templatesTest: TemplatesConfig = {
  enablePreviewRewrites: true,
  templates: {
    "clothing:1": vercelClothing("1", "https://template-1-steel.vercel.app"),
    "clothing:2": vercelClothing("2", "https://template-2-steel.vercel.app"),
    "clothing:3": vercelClothing("3", "https://template-3-steel.vercel.app"),
    "clothing:4": vercelClothing("4", "https://template-4-steel-three.vercel.app"),
    "clothing:5": vercelClothing("5", "https://template-5-steel-cyan.vercel.app"),
    "clothing:6": vercelClothing("6", "https://template-6-steel.vercel.app"),
    "clothing:7": vercelClothing("7", "https://template-7-steel.vercel.app"),
    "clothing:8": vercelClothing("8", "https://template-8-steel.vercel.app"),
  },
};
