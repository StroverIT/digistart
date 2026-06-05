import type { TemplateRuntimeEntry, TemplatesConfig } from "./templates.types";

/**
 * Template upstream URLs. Commit updates when template deployments change.
 * previewOrigin is used for live preview links on Vercel so /_next assets resolve correctly
 * (proxied previewPath requires basePath on each template app).
 */
const vercelClothing = (
  id: string,
  rewriteTarget: string,
): TemplateRuntimeEntry => ({
  previewPath: `/preview/clothing/${id}`,
  rewriteTarget,
  previewOrigin: rewriteTarget,
});

export const templatesConfig: TemplatesConfig = {
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
    "clothing:9": vercelClothing("9", "https://template-9-steel.vercel.app"),
    "clothing:10": vercelClothing("10", "https://template-10-steel.vercel.app"),
    "clothing:11": vercelClothing("11", "https://template-11-steel.vercel.app"),
    "clothing:12": vercelClothing("12", "https://template-12-steel.vercel.app"),
    "clothing:13": vercelClothing("13", "https://template-13-steel.vercel.app"),
  },
};
