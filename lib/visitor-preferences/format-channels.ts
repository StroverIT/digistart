import { SALES_CHANNEL_LABELS } from "@/lib/visitor-preferences/constants";
import type { SalesChannel } from "@/lib/visitor-preferences/types";

function channelDisplayLabel(channel: SalesChannel, otherLabel?: string): string {
  if (channel === "other") {
    return otherLabel?.trim() || SALES_CHANNEL_LABELS.other;
  }
  return SALES_CHANNEL_LABELS[channel];
}

/** Bulgarian list: "Instagram", "Instagram и Facebook", "A, B и C". */
export function formatSalesChannelsList(
  channels: readonly SalesChannel[],
  otherLabel?: string,
): string {
  const labels = channels.map((c) => channelDisplayLabel(c, otherLabel));
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} и ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} и ${labels[labels.length - 1]}`;
}

/** For "A, B или C" phrasing used in landing copy. */
export function formatSalesChannelsListOr(
  channels: readonly SalesChannel[],
  otherLabel?: string,
): string {
  const labels = channels.map((c) => channelDisplayLabel(c, otherLabel));
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} или ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} или ${labels[labels.length - 1]}`;
}
