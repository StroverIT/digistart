import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  listStoreDomains,
  updateStoreDomainStatus,
} from "@/lib/server/store-domains";
import type { StoreDomainStatus } from "@/lib/store-dns";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const domains = await listStoreDomains();
    const userIds = [...new Set(domains.map((d) => d.userId))];
    const users =
      userIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, email: true, name: true },
          })
        : [];
    const userById = new Map(users.map((u) => [u.id, u]));

    return NextResponse.json({
      domains: domains.map((d) => ({
        ...d,
        user: userById.get(d.userId) ?? null,
      })),
    });
  } catch (error) {
    console.error("listStoreDomains", error);
    return NextResponse.json({ error: "Failed to load domains" }, { status: 500 });
  }
}

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "configured", "misconfigured"]),
  adminNotes: z.string().max(2000).nullable().optional(),
});

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const domain = await updateStoreDomainStatus(
      parsed.data.id,
      parsed.data.status as StoreDomainStatus,
      parsed.data.adminNotes,
    );
    return NextResponse.json({ domain });
  } catch (error) {
    console.error("updateStoreDomainStatus", error);
    return NextResponse.json({ error: "Failed to update domain" }, { status: 500 });
  }
}
