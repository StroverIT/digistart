import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_QUESTIONS = new Set(["sales_channels", "monthly_orders", "service_interest"]);
const VALID_SALES_ANSWERS = new Set(["instagram", "facebook", "olx", "other"]);
const VALID_MONTHLY_ORDER_ANSWERS = new Set(["0-10", "10-50", "50-100", "100+"]);
const VALID_SERVICE_ANSWERS = new Set([
  "online-store",
  "social-media",
  "ads",
  "google-business",
]);

interface SurveyAnswerPayload {
  question: string;
  answer: string;
  page?: string;
  sessionId?: string;
  otherLabel?: string;
}

function isValidPayload(payload: unknown): payload is SurveyAnswerPayload {
  if (!payload || typeof payload !== "object") return false;
  const parsed = payload as Partial<SurveyAnswerPayload>;
  if (typeof parsed.question !== "string" || !VALID_QUESTIONS.has(parsed.question)) {
    return false;
  }
  if (typeof parsed.answer !== "string" || parsed.answer.length === 0) return false;

  if (parsed.question === "sales_channels") {
    if (!VALID_SALES_ANSWERS.has(parsed.answer)) return false;
  } else if (parsed.question === "monthly_orders") {
    if (!VALID_MONTHLY_ORDER_ANSWERS.has(parsed.answer)) return false;
  } else if (!VALID_SERVICE_ANSWERS.has(parsed.answer)) {
    return false;
  }

  if (parsed.page != null && typeof parsed.page !== "string") return false;
  if (parsed.sessionId != null && typeof parsed.sessionId !== "string") return false;
  if (parsed.otherLabel != null && typeof parsed.otherLabel !== "string") return false;

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    if (!isValidPayload(body)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await prisma.analyticsEvent.create({
      data: {
        eventType: "survey_answer",
        page: body.page ?? "/",
        sessionId: body.sessionId ?? null,
        metadata: {
          question: body.question,
          answer: body.answer,
          ...(body.otherLabel ? { other_label: body.otherLabel } : {}),
        },
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save survey answer" }, { status: 500 });
  }
}
