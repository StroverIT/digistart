import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "admin@digistart.bg").toLowerCase();

export async function upsertGoogleOAuthUser(input: {
  email: string;
  name?: string | null;
}) {
  const email = input.email.toLowerCase().trim();
  if (!email) {
    throw new Error("Google account is missing an email address.");
  }
  if (email === ADMIN_EMAIL) {
    throw new Error("Admin accounts must sign in with email and password.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.role === "admin") {
    throw new Error("Admin accounts must sign in with email and password.");
  }

  if (existing) {
    if (!existing.name && input.name?.trim()) {
      return prisma.user.update({
        where: { id: existing.id },
        data: { name: input.name.trim() },
      });
    }
    return existing;
  }

  return prisma.user.create({
    data: {
      email,
      name: input.name?.trim() || null,
      role: "customer",
    },
  });
}
