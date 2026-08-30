import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { sendTestThreeFreeTipsStageEmail } from "@/lib/server/three-free-tips-campaign";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

const testSendSchema = z.object({
  email: z.string().trim().email(),
  stage: z.coerce.number().int().positive(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json: unknown = await req.json().catch(() => null);
    const parsed = testSendSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Моля, изберете валиден имейл и етап.", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const result = await sendTestThreeFreeTipsStageEmail(parsed.data);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неуспешно изпращане на тестовия имейл.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
