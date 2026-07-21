import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribeToGoogleNewsletter } from "@/lib/server/newsletter";

const subscribeSchema = z.object({
  email: z.string().trim().email(),
  firstName: z.string().trim().min(1).max(100),
});

export async function POST(req: Request) {
  try {
    const json: unknown = await req.json().catch(() => null);
    const parsed = subscribeSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Моля, въведете валидно име и имейл.",
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    const result = await subscribeToGoogleNewsletter(
      parsed.data.email,
      parsed.data.firstName,
    );

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
