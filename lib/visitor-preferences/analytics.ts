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
      question: params.question,
      answer: params.answer,
      page,
      sessionId: getAnalyticsSessionId(),
      otherLabel: params.otherLabel,
    }),
    keepalive: true,
  }).catch(() => {});
}
