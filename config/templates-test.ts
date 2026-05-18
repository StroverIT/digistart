import type { TemplatesConfig } from "./templates.types";

/**
 * Shared local / staging template URLs for all developers.
 * Commit changes here so everyone uses the same preview targets.
 */
export const templatesTest: TemplatesConfig = {
  enablePreviewRewrites: true,
  templates: {
    "clothing:1": {
      previewPath: "/preview/clothing/1",
      rewriteTarget: "http://localhost:3001",
      previewOrigin: "http://localhost:3001",
    },
  },
};
