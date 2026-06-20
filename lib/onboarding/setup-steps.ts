import { isStoreSocialSetupComplete } from "@/lib/onboarding/completion";
import type { OnboardingRequirements } from "@/lib/onboarding/requirements";
import { isProductSalesType } from "@/lib/onboarding/requirements";
import { hasSelectedTemplates } from "@/lib/onboarding/selected-templates";
import type { TenantProjectDto } from "@/lib/server/tenant-projects";

/** Persisted onboarding checklist step ids (online store setup guide + wizard). */
export const ONBOARDING_SETUP_STEP_IDS = [
  "product-type",
  "template",
  "business",
  "products",
  "social",
] as const;

export type OnboardingSetupStepId = (typeof ONBOARDING_SETUP_STEP_IDS)[number];

export type OnboardingStepsCompleted = Partial<Record<OnboardingSetupStepId, boolean>>;

const SETUP_STEP_ID_SET = new Set<string>(ONBOARDING_SETUP_STEP_IDS);

export function parseOnboardingStepsCompleted(raw: unknown): OnboardingStepsCompleted {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const result: OnboardingStepsCompleted = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (SETUP_STEP_ID_SET.has(key) && value === true) {
      result[key as OnboardingSetupStepId] = true;
    }
  }
  return result;
}

function businessFieldsOk(project: TenantProjectDto | null | undefined): boolean {
  const bs = project?.businessSettings ?? {};
  const name = String(bs.businessName ?? "").trim();
  return name.length > 0;
}

/** Derive step completion from saved project fields (backfill + recompute on save). */
export function deriveSetupStepsFromProject(
  project: TenantProjectDto | null | undefined,
  requirements: OnboardingRequirements,
): OnboardingStepsCompleted {
  if (!project) return {};

  const bs = project.businessSettings ?? {};
  const productNotes = String(bs.productNotes ?? "").trim();

  return {
    "product-type": isProductSalesType(bs.productSalesType),
    template: hasSelectedTemplates(bs, project.templateId),
    business: businessFieldsOk(project),
    products: productNotes.length > 0,
    social: isStoreSocialSetupComplete(project, requirements),
  };
}

/** Whether a step counts as done for the setup guide (stored flag wins, then derived). */
export function resolveSetupStepOk(
  stepId: OnboardingSetupStepId,
  stored: OnboardingStepsCompleted,
  derived: OnboardingStepsCompleted,
): boolean {
  if (stored[stepId] === true) return true;
  if (stored[stepId] === false) return false;
  return derived[stepId] === true;
}

/** Merge newly derived completions into persisted flags (true is sticky). */
export function mergeStepsCompletedForSave(
  stored: OnboardingStepsCompleted,
  derived: OnboardingStepsCompleted,
): OnboardingStepsCompleted {
  const result: OnboardingStepsCompleted = { ...stored };
  for (const id of ONBOARDING_SETUP_STEP_IDS) {
    if (derived[id] === true) {
      result[id] = true;
    }
  }
  return result;
}

export function markSetupStepComplete(
  stored: OnboardingStepsCompleted,
  stepId: OnboardingSetupStepId,
): OnboardingStepsCompleted {
  return { ...stored, [stepId]: true };
}

/** Maps wizard step numbers to setup step ids completed when leaving that step. */
export function setupStepsCompletedForWizardStep(
  wizardStep: number,
  requirements: OnboardingRequirements,
): OnboardingSetupStepId[] {
  switch (wizardStep) {
    case 1:
      return requirements.showCategoryTemplate ? ["product-type"] : [];
    case 2:
      return requirements.showTemplatePicker ? ["template"] : [];
    case 3:
      return requirements.showBusiness ? ["business", "products"] : [];
    case 4:
      return requirements.showIntegrations ? ["social"] : [];
    default:
      return [];
  }
}

export function isWizardStepComplete(
  wizardStepId: number,
  steps: OnboardingStepsCompleted,
  requirements: OnboardingRequirements,
): boolean {
  const mapped = setupStepsCompletedForWizardStep(wizardStepId, requirements);
  if (mapped.length === 0) return false;
  return mapped.every((id) => steps[id] === true);
}
