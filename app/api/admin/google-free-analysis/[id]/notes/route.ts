import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { updateGoogleFreeAnalysisLeadNotes } from "@/lib/server/google-free-analysis-leads";

const paramsSchema = z.object({
  id: z.string().min(1),
});

const payloadSchema = z.object({
  notes: z.string().trim().max(5000).nullable(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session;
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const params = paramsSchema.safeParse(await context.params);
    if (!params.success) {
      return NextResponse.json({ error: "Invalid lead id." }, { status: 400 });
    }

    const parsed = payloadSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid notes payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const notes = parsed.data.notes?.trim() ? parsed.data.notes.trim() : null;
    const lead = await updateGoogleFreeAnalysisLeadNotes(params.data.id, notes);

    return NextResponse.json({
      lead: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        website: lead.website,
        company: lead.company,
        googleMapsUrl: lead.googleMapsUrl,
        urgency: lead.urgency,
        status: lead.status,
        notes: lead.notes,
        source: lead.source,
        pagePath: lead.pagePath,
        createdAt: lead.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update google free analysis lead notes." },
      { status: 500 },
    );
  }
}
