/** Map key: `${category}:${templateId}` (e.g. `clothing:1`) */
export type TemplateConfigKey = `${string}:${string}`;

export type TemplateRuntimeEntry = {
  /** Proxied path on digistart (e.g. `/preview/clothing/1`). */
  previewPath: string;
  /** Upstream app URL for Next.js rewrites. */
  rewriteTarget: string;
  /**
   * Direct URL for iframe / “open preview” links when the template app serves assets from /_next.
   * Required in prod unless each template sets basePath to match previewPath.
   */
  previewOrigin?: string;
};

export type TemplatesConfig = {
  enablePreviewRewrites: boolean;
  templates: Record<TemplateConfigKey, TemplateRuntimeEntry>;
};
