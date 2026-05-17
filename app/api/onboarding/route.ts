import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  getOrCreateTenantProjectForUser,
  getTenantProjectForUser,
  updateTenantProject,
} from "@/lib/server/tenant-projects";
import { getTemplate } from "@/lib/data/templates";

const patchSchema = z.object({
  step: z.number().int().min(1).max(4).optional(),
  productCategory: z.enum(["clothing"]).optional(),
  templateId: z.string().optional(),
  businessSettings: z.record(z.unknown()).optional(),
  socialSettings: z.record(z.unknown()).optional(),
  dbMigrationNotes: z.string().optional(),
  setupStatus: z.enum(["draft", "in_progress", "live"]).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project =
    (await getTenantProjectForUser(session.user.id)) ??
    (await getOrCreateTenantProjectForUser(session.user.id));

  return NextResponse.json({ project });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  let project = await getOrCreateTenantProjectForUser(session.user.id);

  const category = parsed.data.productCategory ?? project.productCategory;

  let previewSlug: string | undefined;
  if (parsed.data.templateId && category) {
    const template = getTemplate(category, parsed.data.templateId);
    if (template) {
      previewSlug = `${category}/${template.id}`;
    }
  }

  project = await updateTenantProject(project.id, {
    ...(parsed.data.step != null ? { onboardingStep: parsed.data.step } : {}),
    ...(parsed.data.productCategory ? { productCategory: parsed.data.productCategory } : {}),
    ...(parsed.data.templateId ? { templateId: parsed.data.templateId } : {}),
    ...(previewSlug ? { previewSlug } : {}),
    ...(parsed.data.businessSettings != null
      ? { businessSettings: parsed.data.businessSettings }
      : {}),
    ...(parsed.data.socialSettings != null ? { socialSettings: parsed.data.socialSettings } : {}),
    ...(parsed.data.dbMigrationNotes != null
      ? { dbMigrationNotes: parsed.data.dbMigrationNotes }
      : {}),
    ...(parsed.data.setupStatus ? { setupStatus: parsed.data.setupStatus } : {}),
    ...(parsed.data.step === 4 ? { setupStatus: "in_progress" } : {}),
  });

  return NextResponse.json({ project });
}
