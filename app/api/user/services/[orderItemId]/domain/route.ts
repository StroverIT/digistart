import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { ONLINE_STORE_SERVICE_ID } from "@/lib/store-dns";
import { prisma } from "@/lib/prisma";
import {
  getStoreDomainByOrderItemId,
  upsertStoreDomainForOrderItem,
} from "@/lib/server/store-domains";
import { getTenantProjectForUser } from "@/lib/server/tenant-projects";

const postSchema = z.object({
  domain: z.string().min(3).max(253),
});

async function getOwnedOrderItem(orderItemId: string, userId: string) {
  return prisma.orderItem.findFirst({
    where: {
      id: orderItemId,
      serviceId: ONLINE_STORE_SERVICE_ID,
      order: {
        userId,
        status: { in: ["paid", "in_progress", "completed"] },
      },
    },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderItemId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderItemId } = await params;
  const item = await getOwnedOrderItem(orderItemId, session.user.id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const domain = await getStoreDomainByOrderItemId(orderItemId);
    return NextResponse.json({ domain });
  } catch (error) {
    console.error("getStoreDomainByOrderItemId", error);
    return NextResponse.json({ error: "Failed to load domain" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderItemId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderItemId } = await params;
  const item = await getOwnedOrderItem(orderItemId, session.user.id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = postSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const tenantProject = await getTenantProjectForUser(session.user.id);

  try {
    const domain = await upsertStoreDomainForOrderItem({
      orderItemId,
      userId: session.user.id,
      serviceId: item.serviceId,
      domain: parsed.data.domain,
      tenantProjectId: tenantProject?.id ?? null,
    });
    return NextResponse.json({ domain });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_DOMAIN") {
        return NextResponse.json(
          { error: "Моля, въведи валидно домейн име (напр. magazin.bg)." },
          { status: 400 },
        );
      }
      if (error.message === "DOMAIN_TAKEN") {
        return NextResponse.json(
          { error: "Този домейн вече е регистриран към друга услуга." },
          { status: 409 },
        );
      }
    }
    console.error("upsertStoreDomainForOrderItem", error);
    return NextResponse.json({ error: "Failed to save domain" }, { status: 500 });
  }
}
