import type { TenantProjectDto } from "@/lib/server/tenant-projects";

export function isOnboardingIncomplete(project: TenantProjectDto | null | undefined): boolean {
  if (!project) return false;
  return project.onboardingStep < 4 && project.setupStatus === "draft";
}
