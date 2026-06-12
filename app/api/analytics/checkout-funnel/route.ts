import { NextRequest, NextResponse } from "next/server";
import { isCheckoutFunnelStage } from "@/lib/analytics/checkout-funnel";
import { prisma } from "@/lib/prisma";

interface CheckoutFunnelPayload {
  stage: string;
  action: string;
  logicalStep: number;
  totalSteps: number;
  isLoggedIn: boolean;
  sessionId?: string;
  page?: string;
}

function isValidPayload(payload: unknown): payload is CheckoutFunnelPayload {
  if (!payload || typeof payload !== "object") return false;
  const parsed = payload as Partial<CheckoutFunnelPayload>;
  return (
    typeof parsed.stage === "string" &&
    isCheckoutFunnelStage(parsed.stage) &&
    parsed.action === "view" &&
    typeof parsed.logicalStep === "number" &&
    typeof parsed.totalSteps === "number" &&
    typeof parsed.isLoggedIn === "boolean"
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
        eventType: "checkout_funnel",
        page: body.page ?? "/checkout",
        sessionId: body.sessionId ?? null,
        metadata: {
          stage: body.stage,
          action: body.action,
          logical_step: body.logicalStep,
          total_steps: body.totalSteps,
          is_logged_in: body.isLoggedIn,
        },
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save checkout funnel event" }, { status: 500 });
  }
}
