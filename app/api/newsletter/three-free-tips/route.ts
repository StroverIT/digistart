import { NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeMetaAttribution } from "@/lib/analytics/source";
import { subscribeToThreeFreeTips } from "@/lib/server/newsletter";

const attributionSchema = z
  .object({
    utm_source: z.string().trim().max(200).optional(),
    utm_medium: z.string().trim().max(200).optional(),
    utm_campaign: z.string().trim().max(200).optional(),
    utm_term: z.string().trim().max(200).optional(),
    utm_content: z.string().trim().max(200).optional(),
    campaign_id: z.string().trim().max(200).optional(),
    adset_id: z.string().trim().max(200).optional(),
    ad_id: z.string().trim().max(200).optional(),
    captured_at: z.string().trim().max(200).optional(),
    landing_page: z.string().trim().max(500).optional(),
  })
  .optional()
  .nullable();

const subscribeSchema = z.object({
  email: z.string().trim().email(),
  attribution: attributionSchema,
});

export async function POST(req: Request) {
  try {
    const json: unknown = await req.json().catch(() => null);
    const parsed = subscribeSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Моля, въведете валиден имейл.", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const attribution = sanitizeMetaAttribution(
      parsed.data.attribution as Record<string, unknown> | null | undefined,
    );

    const result = await subscribeToThreeFreeTips(parsed.data.email, attribution);

    return NextResponse.json({
      ok: true,
      alreadySubscribed: result.alreadySubscribed,
      emailSent: result.emailSent,
    });
  } catch {
    return NextResponse.json(
      { error: "Възникна грешка. Моля, опитайте отново." },
      { status: 500 },
    );
  }
}
