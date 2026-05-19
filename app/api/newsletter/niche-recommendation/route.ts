import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribeToNicheRecommendation } from "@/lib/server/newsletter";

const nicheRecommendationSchema = z.object({
  email: z.string().trim().email(),
  niche: z.string().trim().min(2, "Моля, опишете нишата (поне 2 символа)."),
});

export async function POST(req: Request) {
  try {
    const json: unknown = await req.json().catch(() => null);
    const parsed = nicheRecommendationSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Моля, въведете валиден имейл и ниша.", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const result = await subscribeToNicheRecommendation(parsed.data.email, parsed.data.niche);

    if (result.status === "invalid_niche") {
      return NextResponse.json(
        { error: "Моля, опишете нишата (поне 2 символа)." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      alreadySubscribed: result.alreadySubscribed,
    });
  } catch {
    return NextResponse.json(
      { error: "Възникна грешка. Моля, опитайте отново." },
      { status: 500 },
    );
  }
}
