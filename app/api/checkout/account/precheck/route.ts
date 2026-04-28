import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  email: z.string().email(),
});

/** Returns whether email is free for guest checkout account creation (no User yet). */
export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Невалиден имейл." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    return NextResponse.json({ available: !existing });
  } catch {
    return NextResponse.json({ error: "Грешка." }, { status: 500 });
  }
}
