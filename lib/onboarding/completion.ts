import type { OnboardingRequirements } from "@/lib/onboarding/requirements";
import {
  isProductSalesType,
  isValidEmail,
  isValidUrl,
  parseSocialChannelsFromSettings,
} from "@/lib/onboarding/requirements";
import type { TenantProjectDto } from "@/lib/server/tenant-projects";
import { hasSelectedTemplates } from "@/lib/onboarding/selected-templates";

function businessFieldsOk(project: TenantProjectDto | null | undefined): boolean {
  const bs = project?.businessSettings ?? {};
  const name = String(bs.businessName ?? "").trim();
  const phone = String(bs.phone ?? "").trim();
  const email = String(bs.email ?? "").trim();
  return Boolean(name && phone && email && isValidEmail(email));
}

function filledSocialChannels(project: TenantProjectDto | null | undefined): { label?: string; profileUrl: string }[] {
  const ss = project?.socialSettings ?? {};
  return parseSocialChannelsFromSettings(ss, 0).filter(
    (c) => c.profileUrl.trim() && isValidUrl(c.profileUrl),
  );
}

/** Integrations step (wizard step 4) satisfied for the given requirements. */
export function isIntegrationsStepComplete(
  project: TenantProjectDto | null | undefined,
  requirements: OnboardingRequirements,
): boolean {
  if (!project) return false;
  if (!requirements.showIntegrations) return true;

  const channels = filledSocialChannels(project);
  if (requirements.socialChannelCount > 0) {
    if (channels.length < requirements.socialChannelCount) return false;
  }

  if (requirements.showGoogleBusinessLink) {
    const url = String(project.socialSettings?.googleBusinessUrl ?? "").trim();
    if (!url || !isValidUrl(url)) return false;
  }

  // Store-only: integrations optional until user explicitly finishes wizard.
  if (
    requirements.showCategoryTemplate &&
    requirements.socialChannelCount === 0 &&
    !requirements.showGoogleBusinessLink
  ) {
    return project.setupStatus !== "draft";
  }

  // Social / GMB: must have finished wizard (not draft).
  if (!requirements.showCategoryTemplate) {
    return project.setupStatus !== "draft";
  }

  return project.setupStatus !== "draft";
}

export function isBusinessStepComplete(
  project: TenantProjectDto | null | undefined,
  requirements: OnboardingRequirements,
): boolean {
  if (!requirements.showBusiness) return true;
  if (!businessFieldsOk(project)) return false;
  if (requirements.showCategoryTemplate) {
    const notes = String(project?.businessSettings?.productNotes ?? "").trim();
    if (!notes) return false;
  }
  return true;
}

export function isCategoryTemplateStepComplete(
  project: TenantProjectDto | null | undefined,
  requirements: OnboardingRequirements,
): boolean {
  if (!requirements.showCategoryTemplate) return true;
  const productSalesType = project?.businessSettings?.productSalesType;
  return Boolean(
    isProductSalesType(productSalesType) &&
      hasSelectedTemplates(project?.businessSettings, project?.templateId),
  );
}

/** Whether the tenant project satisfies all active wizard requirements. */
export function isProjectOnboardingComplete(
  project: TenantProjectDto | null | undefined,
  requirements: OnboardingRequirements,
): boolean {
  if (!project) return false;
  return (
    isCategoryTemplateStepComplete(project, requirements) &&
    isBusinessStepComplete(project, requirements) &&
    isIntegrationsStepComplete(project, requirements)
  );
}
