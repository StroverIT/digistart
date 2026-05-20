import { templatesConfig } from "./templates.config";
import type {
  TemplateConfigKey,
  TemplateRuntimeEntry,
  TemplatesConfig,
} from "./templates.types";

export type { TemplateConfigKey, TemplateRuntimeEntry, TemplatesConfig };

export function toTemplateConfigKey(category: string, id: string): TemplateConfigKey {
  return `${category}:${id}`;
}

export function getActiveTemplatesConfig(): TemplatesConfig {
  return templatesConfig;
}

export function getTemplateRuntimeEntry(
  category: string,
  id: string,
): TemplateRuntimeEntry | undefined {
  return getActiveTemplatesConfig().templates[toTemplateConfigKey(category, id)];
}

export function getTemplateRewriteTarget(category: string, id: string): string | undefined {
  return getTemplateRuntimeEntry(category, id)?.rewriteTarget;
}

/** Next.js rewrite rules derived from the active templates config. */
export function buildTemplatePreviewRewrites(config: TemplatesConfig = getActiveTemplatesConfig()) {
  if (!config.enablePreviewRewrites) return [];

  const rewrites: { source: string; destination: string }[] = [];

  for (const entry of Object.values(config.templates)) {
    const base = entry.previewPath.replace(/\/$/, "");
    const target = entry.rewriteTarget.replace(/\/$/, "");
    rewrites.push(
      { source: base, destination: `${target}/` },
      { source: `${base}/:path*`, destination: `${target}/:path*` },
    );
  }

  return rewrites;
}
