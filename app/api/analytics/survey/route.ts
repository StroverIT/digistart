import { NextRequest, NextResponse } from "next/server";
import {
  buildSurveyComboKey,
  buildSurveyComboLabel,
  type SurveyCompletionPayload as SurveyComboPayload,
} from "@/lib/analytics/survey-combinations";
import { prisma } from "@/lib/prisma";
import type {
  MonthlyOrderVolume,
  SalesChannel,
  VisitorServiceId,
} from "@/lib/visitor-preferences/types";

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
  kind: "answer";
  question: string;
  answer: string;
  page?: string;
  sessionId?: string;
  otherLabel?: string;
}

interface SurveyCompletionRequest {
  kind: "completion";
  salesChannels: string[];
  monthlyOrders: string;
  selectedServices: string[];
  primaryService: string;
  otherChannelLabel?: string;
  comboKey?: string;
  page?: string;
  sessionId?: string;
}

function isValidAnswerPayload(payload: unknown): payload is SurveyAnswerPayload {
  if (!payload || typeof payload !== "object") return false;
  const parsed = payload as Partial<SurveyAnswerPayload>;
  if (parsed.kind !== "answer") return false;
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

function isValidCompletionPayload(payload: unknown): payload is SurveyCompletionRequest {
  if (!payload || typeof payload !== "object") return false;
  const parsed = payload as Partial<SurveyCompletionRequest>;
  if (parsed.kind !== "completion") return false;
  if (!Array.isArray(parsed.salesChannels) || parsed.salesChannels.length === 0) return false;
  if (!parsed.salesChannels.every((c) => VALID_SALES_ANSWERS.has(String(c)))) return false;
  if (typeof parsed.monthlyOrders !== "string" || !VALID_MONTHLY_ORDER_ANSWERS.has(parsed.monthlyOrders)) {
    return false;
  }
  if (!Array.isArray(parsed.selectedServices) || parsed.selectedServices.length === 0) return false;
  if (!parsed.selectedServices.every((s) => VALID_SERVICE_ANSWERS.has(String(s)))) return false;
  if (typeof parsed.primaryService !== "string" || !VALID_SERVICE_ANSWERS.has(parsed.primaryService)) {
    return false;
  }
  if (
    parsed.salesChannels.includes("other") &&
    (!parsed.otherChannelLabel || parsed.otherChannelLabel.trim().length === 0)
  ) {
    return false;
  }
  if (parsed.page != null && typeof parsed.page !== "string") return false;
  if (parsed.sessionId != null && typeof parsed.sessionId !== "string") return false;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;

    if (isValidCompletionPayload(body)) {
      const completionInput: SurveyComboPayload = {
        salesChannels: [...body.salesChannels].sort() as SalesChannel[],
        otherChannelLabel: body.otherChannelLabel?.trim(),
        monthlyOrders: body.monthlyOrders as MonthlyOrderVolume,
        selectedServices: [...body.selectedServices].sort() as VisitorServiceId[],
        primaryService: body.primaryService as VisitorServiceId,
      };
      const comboKey =
        typeof body.comboKey === "string" && body.comboKey.length > 0
          ? body.comboKey
          : buildSurveyComboKey(completionInput);
      const comboLabel = buildSurveyComboLabel(completionInput);

      await prisma.analyticsEvent.create({
        data: {
          eventType: "survey_completion",
          page: body.page ?? "/",
          sessionId: body.sessionId ?? null,
          metadata: {
            sales_channels: completionInput.salesChannels,
            other_label: body.otherChannelLabel?.trim() ?? null,
            monthly_orders: body.monthlyOrders,
            selected_services: completionInput.selectedServices,
            primary_service: body.primaryService,
            combo_key: comboKey,
            combo_label: comboLabel,
          },
          createdAt: new Date(),
        },
      });

      return NextResponse.json({ ok: true });
    }

    if (isValidAnswerPayload(body)) {
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
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to save survey event" }, { status: 500 });
  }
}
