import {
  MONTHLY_ORDER_VOLUME_OPTIONS,
  SALES_CHANNEL_LABELS,
  SERVICE_SURVEY_OPTIONS,
} from "@/lib/visitor-preferences/constants";
import type {
  MonthlyOrderVolume,
  SalesChannel,
  VisitorServiceId,
} from "@/lib/visitor-preferences/types";

export type SurveyCompletionPayload = {
  salesChannels: SalesChannel[];
  otherChannelLabel?: string;
  monthlyOrders: MonthlyOrderVolume;
  selectedServices: VisitorServiceId[];
  primaryService: VisitorServiceId;
};

const SERVICE_LABELS = Object.fromEntries(
  SERVICE_SURVEY_OPTIONS.map((o) => [o.id, o.label]),
) as Record<VisitorServiceId, string>;

const ORDER_LABELS = Object.fromEntries(
  MONTHLY_ORDER_VOLUME_OPTIONS.map((o) => [o.id, o.label]),
) as Record<MonthlyOrderVolume, string>;

function formatChannelPart(channels: readonly SalesChannel[], otherLabel?: string): string {
  const sorted = [...channels].sort();
  return sorted
    .map((c) =>
      c === "other" && otherLabel?.trim()
        ? otherLabel.trim()
        : SALES_CHANNEL_LABELS[c],
    )
    .join(", ");
}

function formatServicesPart(services: readonly VisitorServiceId[]): string {
  return [...services]
    .sort()
    .map((id) => SERVICE_LABELS[id] ?? id)
    .join(", ");
}

export function buildSurveyComboKey(payload: SurveyCompletionPayload): string {
  const channels = [...payload.salesChannels].sort().join(",");
  const services = [...payload.selectedServices].sort().join(",");
  const other = payload.otherChannelLabel?.trim() ?? "";
  return `${channels}${other ? `|${other}` : ""}::${payload.monthlyOrders}::${services}`;
}

export function buildSurveyComboLabel(payload: SurveyCompletionPayload): string {
  const channels = formatChannelPart(payload.salesChannels, payload.otherChannelLabel);
  const orders = ORDER_LABELS[payload.monthlyOrders] ?? payload.monthlyOrders;
  const services = formatServicesPart(payload.selectedServices);
  return `${channels} · ${orders} поръчки · ${services}`;
}

export function comboCodeFromIndex(index: number): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (index < alphabet.length) return alphabet[index];
  return `Z${index - alphabet.length + 1}`;
}
