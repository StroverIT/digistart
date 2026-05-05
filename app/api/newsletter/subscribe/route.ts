import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribeToNewsletter } from "@/lib/server/newsletter";

const subscribeSchema = z.object({
  email: z.string().trim().email(),
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

    const result = await subscribeToNewsletter(parsed.data.email, "coming-soon");

    if (result.status === "full") {
      return NextResponse.json(
        {
          error:
            "Всички места в списъка за ранен достъп са заети. Благодарим за интереса!",
        },
        { status: 403 },
      );
    }

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
