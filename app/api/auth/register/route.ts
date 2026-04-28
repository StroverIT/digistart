import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().min(6),
  company: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Невалидни данни.", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Този имейл вече е регистриран." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: parsed.data.name.trim(),
        phone: parsed.data.phone.trim(),
        company: parsed.data.company?.trim() || null,
        role: "customer",
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("register", e);
    return NextResponse.json({ error: "Регистрацията не бе успешна." }, { status: 500 });
  }
}
