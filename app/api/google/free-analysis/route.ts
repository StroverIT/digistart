import { NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeMetaAttribution } from "@/lib/analytics/source";
import { createGoogleFreeAnalysisLead } from "@/lib/server/google-free-analysis-leads";
import { prisma } from "@/lib/prisma";

const attributionSchema = z
  .object({
    campaign: z.string().trim().max(200).optional(),
    adset: z.string().trim().max(200).optional(),
    creative: z.string().trim().max(200).optional(),
    utm_type: z.string().trim().max(200).optional(),
    captured_at: z.string().trim().max(200).optional(),
    landing_page: z.string().trim().max(500).optional(),
  })
  .optional()
  .nullable();

const payloadSchema = z.object({
  name: z.string().trim().min(2, "Въведете две имена."),
  email: z.string().trim().email("Въведете валиден имейл."),
  phone: z.string().trim().min(6, "Въведете валиден телефонен номер."),
  website: z.string().trim().max(300).optional().default(""),
  company: z.string().trim().min(2, "Въведете име на фирмата."),
  urgency: z.enum(["today", "tomorrow", "few_weeks"]),
  source: z.string().trim().max(120).optional(),
  pagePath: z.string().trim().max(300).optional(),
  attribution: attributionSchema,
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

    const { attribution: rawAttribution, ...leadData } = parsed.data;
    const attribution = sanitizeMetaAttribution(
      rawAttribution as Record<string, unknown> | null | undefined,
    );

    const result = await createGoogleFreeAnalysisLead({
      ...leadData,
      googleMapsUrl: "",
    });
    if (result.status !== "ok") {
      return NextResponse.json({ error: "Неуспешно записване." }, { status: 500 });
    }

    if (
      !result.alreadyRegistered &&
      attribution &&
      attribution.utm_type?.toLowerCase() === "paid" &&
      (attribution.campaign || attribution.adset || attribution.creative)
    ) {
      await prisma.analyticsEvent.create({
        data: {
          eventType: "cta_click",
          page: leadData.pagePath?.trim() || "/google/free-analysis",
          metadata: {
            meta_paid_registration: true,
            cta_id: "google_free_analysis_submit",
            ...attribution,
          },
        },
      });
    }

    return NextResponse.json({
      ok: true,
      alreadyRegistered: result.alreadyRegistered,
      emailSent: result.emailSent,
    });
  } catch (error) {
    console.error("[google/free-analysis]", error);
    return NextResponse.json(
      { error: "Възникна грешка. Моля, опитайте отново." },
      { status: 500 },
    );
  }
}
