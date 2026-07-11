import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SALES_STAGE_PATHS, type SalesStagePathId } from "@/lib/funnel/sales-stage";

const VALID_PATH_IDS = new Set<string>(SALES_STAGE_PATHS);

interface FunnelSalesStagePayload {
  funnelId: string;
  pathId: string;
  page?: string;
  sessionId?: string;
}

function isValidPayload(body: unknown): body is FunnelSalesStagePayload {
  if (!body || typeof body !== "object") return false;
  const payload = body as FunnelSalesStagePayload;
  if (typeof payload.funnelId !== "string" || payload.funnelId.trim().length === 0) return false;
  if (!VALID_PATH_IDS.has(payload.pathId)) return false;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    if (!isValidPayload(body)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const pathId = body.pathId as SalesStagePathId;

    await prisma.analyticsEvent.create({
      data: {
        eventType: "funnel_sales_stage_selection",
        page: body.page ?? "/",
        sessionId: body.sessionId ?? null,
        metadata: {
          funnel_id: body.funnelId.trim(),
          path_id: pathId,
        },
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to record selection" }, { status: 500 });
  }
}
