import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { sendGooglePromisedAnalysisEmail } from "@/lib/server/google-promised-analysis-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

const paramsSchema = z.object({
  id: z.string().min(1),
});

const payloadSchema = z.object({
  youtubeUrl: z.string().trim().url(),
  greetingName: z.string().trim().min(1).max(120).optional(),
  test: z.boolean().optional(),
});

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = paramsSchema.safeParse(await context.params);
    if (!params.success) {
      return NextResponse.json({ error: "Invalid lead id." }, { status: 400 });
    }

    const parsed = payloadSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Моля, въведете валиден YouTube линк.",
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    const result = await sendGooglePromisedAnalysisEmail({
      leadId: params.data.id,
      leadKind: "google-analysis-3-tips",
      youtubeUrl: parsed.data.youtubeUrl,
      greetingName: parsed.data.greetingName,
      test: parsed.data.test,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неуспешно изпращане на имейла.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
