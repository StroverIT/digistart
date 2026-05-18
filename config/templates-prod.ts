import type { TemplatesConfig } from "./templates.types";

/**
 * Production template upstream URLs. Commit updates when template deployments change.
 * previewOrigin is omitted so previews use proxied previewPath (template should set basePath).
 */
export const templatesProd: TemplatesConfig = {
  enablePreviewRewrites: true,
  templates: {
    "clothing:1": {
      previewPath: "/preview/clothing/1",
      rewriteTarget: "https://template-clothing-1.digistart.bg",
    },
  },
};
