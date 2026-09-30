import { NextResponse } from "next/server";
import { z } from "zod";
import {
  unsubscribeNewsletterByEmail,
  unsubscribeNewsletterByUid,
} from "@/lib/server/newsletter";

const unsubscribeSchema = z.union([
  z.object({
    uid: z.string().trim().min(1),
  }),
  z.object({
    email: z.string().trim().email(),
  }),
]);

export async function POST(req: Request) {
  try {
    const json: unknown = await req.json().catch(() => null);
    const parsed = unsubscribeSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Моля, въведете валиден имейл.", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const result =
      "uid" in parsed.data
        ? await unsubscribeNewsletterByUid(parsed.data.uid)
        : await unsubscribeNewsletterByEmail(parsed.data.email);

    // Always succeed from the client's perspective for privacy when not found.
    if (result.status === "not_found") {
      return NextResponse.json({ ok: true, alreadyUnsubscribed: false });
    }

    return NextResponse.json({
      ok: true,
      alreadyUnsubscribed: result.alreadyUnsubscribed,
    });
  } catch {
    return NextResponse.json(
      { error: "Възникна грешка. Моля, опитайте отново." },
      { status: 500 },
    );
  }
}
