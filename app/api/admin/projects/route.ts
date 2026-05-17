import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { listTenantProjects, updateTenantProject } from "@/lib/server/tenant-projects";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const projects = await listTenantProjects();
  return NextResponse.json({ projects });
}

const patchSchema = z.object({
  id: z.string(),
  setupStatus: z.enum(["draft", "in_progress", "live"]).optional(),
  socialSettings: z.record(z.unknown()).optional(),
  dbMigrationNotes: z.string().optional(),
});

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const project = await updateTenantProject(parsed.data.id, {
    ...(parsed.data.setupStatus ? { setupStatus: parsed.data.setupStatus } : {}),
    ...(parsed.data.socialSettings != null
      ? { socialSettings: parsed.data.socialSettings }
      : {}),
    ...(parsed.data.dbMigrationNotes != null
      ? { dbMigrationNotes: parsed.data.dbMigrationNotes }
      : {}),
  });

  return NextResponse.json({ project });
}
