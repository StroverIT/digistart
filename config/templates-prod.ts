import type { TemplatesConfig } from "./templates.types";

/**
 * Production template upstream URLs. Commit updates when template deployments change.
 * previewOrigin is used for live preview links on Vercel so /_next assets resolve correctly
 * (proxied previewPath requires basePath on each template app).
 */
export const templatesProd: TemplatesConfig = {
  enablePreviewRewrites: true,
  templates: {
    "clothing:1": {
      previewPath: "/preview/clothing/1",
      rewriteTarget: "https://template-1-steel.vercel.app",
      previewOrigin: "https://template-1-steel.vercel.app",
    },
    "clothing:2": {
      previewPath: "/preview/clothing/2",
      rewriteTarget: "https://template-2-steel.vercel.app",
      previewOrigin: "https://template-2-steel.vercel.app",
    },
    "clothing:3": {
      previewPath: "/preview/clothing/3",
      rewriteTarget: "https://template-3-steel.vercel.app",
      previewOrigin: "https://template-3-steel.vercel.app",
    },
    "clothing:4": {
      previewPath: "/preview/clothing/4",
      rewriteTarget: "https://template-4-steel-three.vercel.app",
      previewOrigin: "https://template-4-steel-three.vercel.app",
    },
    "clothing:5": {
      previewPath: "/preview/clothing/5",
      rewriteTarget: "https://template-5-steel-cyan.vercel.app",
      previewOrigin: "https://template-5-steel-cyan.vercel.app",
    },
    "clothing:6": {
      previewPath: "/preview/clothing/6",
      rewriteTarget: "https://template-6-steel.vercel.app",
      previewOrigin: "https://template-6-steel.vercel.app",
    },
    "clothing:7": {
      previewPath: "/preview/clothing/7",
      rewriteTarget: "https://template-7-steel.vercel.app",
      previewOrigin: "https://template-7-steel.vercel.app",
    },
    "clothing:8": {
      previewPath: "/preview/clothing/8",
      rewriteTarget: "https://template-8-steel.vercel.app",
      previewOrigin: "https://template-8-steel.vercel.app",
    },
  },
};
