import { buildSurveyComboKey } from "@/lib/analytics/survey-combinations";
import { getAnalyticsSessionId } from "@/lib/analytics/tracker";
import type {
  MonthlyOrderVolume,
  SalesChannel,
  SurveyQuestionId,
  VisitorServiceId,
} from "@/lib/visitor-preferences/types";

export function trackSurveyAnswer(params: {
  question: SurveyQuestionId;
  answer: SalesChannel | MonthlyOrderVolume | VisitorServiceId;
  page?: string;
  otherLabel?: string;
}): void {
  if (typeof window === "undefined") return;

  const page = params.page ?? window.location.pathname + window.location.search;

  void fetch("/api/analytics/survey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind: "answer",
      question: params.question,
      answer: params.answer,
      page,
      sessionId: getAnalyticsSessionId(),
      otherLabel: params.otherLabel,
    }),
    keepalive: true,
  }).catch(() => {});
}

export function trackSurveyCompletion(params: {
  salesChannels: SalesChannel[];
  otherChannelLabel?: string;
  monthlyOrders: MonthlyOrderVolume;
  selectedServices: VisitorServiceId[];
  primaryService: VisitorServiceId;
  page?: string;
}): void {
  if (typeof window === "undefined") return;

  const page = params.page ?? window.location.pathname + window.location.search;
  const salesChannels = [...params.salesChannels].sort();
  const selectedServices = [...params.selectedServices].sort();

  void fetch("/api/analytics/survey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind: "completion",
      page,
      sessionId: getAnalyticsSessionId(),
      salesChannels,
      otherChannelLabel: params.otherChannelLabel,
      monthlyOrders: params.monthlyOrders,
      selectedServices,
      primaryService: params.primaryService,
      comboKey: buildSurveyComboKey({
        salesChannels,
        otherChannelLabel: params.otherChannelLabel,
        monthlyOrders: params.monthlyOrders,
        selectedServices,
        primaryService: params.primaryService,
      }),
    }),
    keepalive: true,
  }).catch(() => {});
}
