import { NextResponse } from "next/server";
import { z } from "zod";
import { recordThreeFreeTipsVideoCtaClick } from "@/lib/server/newsletter";

const clickSchema = z.object({
  uid: z.string().trim().min(1),
  stage: z.coerce.number().int().positive(),
});

export async function POST(req: Request) {
  try {
    const json: unknown = await req.json().catch(() => null);
    const parsed = clickSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Невалидни данни.", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const result = await recordThreeFreeTipsVideoCtaClick(
      parsed.data.uid,
      parsed.data.stage,
    );

    if (result.status === "invalid_stage") {
      return NextResponse.json({ error: "Невалиден етап." }, { status: 400 });
    }

    if (result.status === "not_found") {
      return NextResponse.json({ ok: true, recorded: false });
    }

    return NextResponse.json({ ok: true, recorded: true });
  } catch {
    return NextResponse.json(
      { error: "Възникна грешка. Моля, опитайте отново." },
      { status: 500 },
    );
  }
}
