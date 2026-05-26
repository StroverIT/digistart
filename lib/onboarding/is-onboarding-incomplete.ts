import type { OnboardingRequirements } from "@/lib/onboarding/requirements";
import { isProjectOnboardingComplete } from "@/lib/onboarding/completion";
import type { TenantProjectDto } from "@/lib/server/tenant-projects";

export function isOnboardingIncomplete(
  project: TenantProjectDto | null | undefined,
  requirements?: OnboardingRequirements,
): boolean {
  if (!project) return false;
  if (requirements) {
    return !isProjectOnboardingComplete(project, requirements);
  }
  return project.setupStatus === "draft";
}
