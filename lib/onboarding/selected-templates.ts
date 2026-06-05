import {
  getNicheLabels,
  nicheForTemplateId,
  type TemplateNicheId,
} from "@/lib/data/templates";

export function parseSelectedTemplateIds(
  businessSettings: Record<string, unknown> | null | undefined,
  fallbackTemplateId?: string | null,
): string[] {
  const raw = businessSettings?.selectedTemplateIds;
  if (Array.isArray(raw)) {
    const ids = raw
      .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      .map((id) => id.trim());
    if (ids.length > 0) return [...new Set(ids)];
  }
  if (fallbackTemplateId?.trim()) return [fallbackTemplateId.trim()];
  return [];
}

export function hasSelectedTemplates(
  businessSettings: Record<string, unknown> | null | undefined,
  fallbackTemplateId?: string | null,
): boolean {
  return parseSelectedTemplateIds(businessSettings, fallbackTemplateId).length > 0;
}

export function nicheIdsForTemplateIds(templateIds: string[]): TemplateNicheId[] {
  const ids = new Set<TemplateNicheId>();
  for (const templateId of templateIds) {
    try {
      ids.add(nicheForTemplateId(templateId));
    } catch {
      // ignore unknown template ids
    }
  }
  return [...ids];
}

export function getSelectedNicheLabels(
  businessSettings: Record<string, unknown> | null | undefined,
  fallbackTemplateId?: string | null,
): string[] {
  const templateIds = parseSelectedTemplateIds(businessSettings, fallbackTemplateId);
  return getNicheLabels(nicheIdsForTemplateIds(templateIds));
}
