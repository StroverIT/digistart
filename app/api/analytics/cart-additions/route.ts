import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface CartAdditionPayload {
  serviceId: string;
  serviceName: string;
  comboKey: string;
  comboLabel: string;
  upsellCount: number;
  page?: string;
}

function isValidPayload(payload: unknown): payload is CartAdditionPayload {
  if (!payload || typeof payload !== "object") return false;
  const parsed = payload as Partial<CartAdditionPayload>;
  return (
    typeof parsed.serviceId === "string" &&
    parsed.serviceId.length > 0 &&
    typeof parsed.serviceName === "string" &&
    parsed.serviceName.length > 0 &&
    typeof parsed.comboKey === "string" &&
    parsed.comboKey.length > 0 &&
    typeof parsed.comboLabel === "string" &&
    parsed.comboLabel.length > 0 &&
    typeof parsed.upsellCount === "number"
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    if (!isValidPayload(body)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await prisma.analyticsEvent.create({
      data: {
        eventType: "cart_addition",
        page: body.page ?? "/services",
        metadata: {
          service_id: body.serviceId,
          service_name: body.serviceName,
          combo_key: body.comboKey,
          combo_label: body.comboLabel,
          upsell_count: body.upsellCount,
        },
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save cart addition" }, { status: 500 });
  }
}
