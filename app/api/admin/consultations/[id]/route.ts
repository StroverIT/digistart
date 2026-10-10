import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { deleteConsultationBooking } from "@/lib/server/consultation-bookings";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session;
}

const paramsSchema = z.object({
  id: z.string().min(1),
});

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const params = paramsSchema.safeParse(await context.params);
    if (!params.success) {
      return NextResponse.json({ error: "Invalid consultation id." }, { status: 400 });
    }

    const deleted = await deleteConsultationBooking(params.data.id);
    if (!deleted) {
      return NextResponse.json({ error: "Consultation not found." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      consultation: deleted,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete consultation." },
      { status: 500 },
    );
  }
}
