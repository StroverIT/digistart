import { NextResponse } from "next/server";
import { z } from "zod";
import { createDigitalRoadmapLead } from "@/lib/server/digital-roadmap-leads";

const payloadSchema = z.object({
  name: z.string().trim().min(2, "Въведете две имена."),
  email: z.string().trim().email("Въведете валиден имейл."),
  source: z.string().trim().max(120).optional(),
});

export async function POST(req: Request) {
  try {
    const json: unknown = await req.json().catch(() => null);
    const parsed = payloadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Невалидни данни.", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const result = await createDigitalRoadmapLead(parsed.data);
    if (result.status !== "ok") {
      return NextResponse.json({ error: "Неуспешно записване." }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      alreadyRegistered: result.alreadyRegistered,
      emailSent: result.emailSent,
    });
  } catch {
    return NextResponse.json(
      { error: "Възникна грешка. Моля, опитайте отново." },
      { status: 500 },
    );
  }
}
