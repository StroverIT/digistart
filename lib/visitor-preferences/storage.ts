import { DEFAULT_SALES_CHANNELS, VISITOR_PREFERENCES_STORAGE_KEY } from "@/lib/visitor-preferences/constants";
import {
  VISITOR_PREFERENCES_VERSION,
  type MonthlyOrderVolume,
  type SalesChannel,
  type VisitorPreferencesV1,
  type VisitorServiceId,
} from "@/lib/visitor-preferences/types";

function isSalesChannel(value: unknown): value is SalesChannel {
  return (
    value === "instagram" ||
    value === "facebook" ||
    value === "olx" ||
    value === "other"
  );
}

function isMonthlyOrderVolume(value: unknown): value is MonthlyOrderVolume {
  return value === "0-10" || value === "10-50" || value === "50-100" || value === "100+";
}

function isVisitorServiceId(value: unknown): value is VisitorServiceId {
  return (
    value === "online-store" ||
    value === "ai-automation" ||
    value === "social-media" ||
    value === "ads" ||
    value === "google-business"
  );
}

function parsePreferences(raw: string): VisitorPreferencesV1 | null {
  try {
    const parsed = JSON.parse(raw) as Partial<VisitorPreferencesV1>;
    if (parsed.version !== VISITOR_PREFERENCES_VERSION) return null;
    if (!Array.isArray(parsed.salesChannels)) return null;
    const salesChannels = parsed.salesChannels.filter(isSalesChannel);
    if (salesChannels.length === 0) return null;
    if (!isVisitorServiceId(parsed.primaryService)) return null;
    const selectedServices = Array.isArray(parsed.selectedServices)
      ? parsed.selectedServices.filter(isVisitorServiceId)
      : [parsed.primaryService];
    if (selectedServices.length === 0) return null;
    if (!isMonthlyOrderVolume(parsed.monthlyOrders)) return null;
    if (typeof parsed.completedAt !== "string") return null;

    const otherChannelLabel =
      typeof parsed.otherChannelLabel === "string" && parsed.otherChannelLabel.trim().length > 0
        ? parsed.otherChannelLabel.trim()
        : undefined;

    if (salesChannels.includes("other") && !otherChannelLabel) return null;

    return {
      version: VISITOR_PREFERENCES_VERSION,
      salesChannels,
      otherChannelLabel,
      monthlyOrders: parsed.monthlyOrders,
      selectedServices,
      primaryService: parsed.primaryService,
      completedAt: parsed.completedAt,
    };
  } catch {
    return null;
  }
}

export function getPreferences(): VisitorPreferencesV1 | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(VISITOR_PREFERENCES_STORAGE_KEY);
  if (!raw) return null;
  return parsePreferences(raw);
}

export function savePreferences(prefs: Omit<VisitorPreferencesV1, "version" | "completedAt"> & {
  completedAt?: string;
}): VisitorPreferencesV1 {
  const next: VisitorPreferencesV1 = {
    version: VISITOR_PREFERENCES_VERSION,
    salesChannels: prefs.salesChannels,
    otherChannelLabel: prefs.otherChannelLabel,
    monthlyOrders: prefs.monthlyOrders,
    selectedServices: prefs.selectedServices,
    primaryService: prefs.primaryService,
    completedAt: prefs.completedAt ?? new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(VISITOR_PREFERENCES_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("visitor-preferences-updated"));
  }

  return next;
}

export function clearPreferences(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(VISITOR_PREFERENCES_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("visitor-preferences-updated"));
}

export function hasCompletedSurvey(): boolean {
  return getPreferences() !== null;
}

export function getEffectiveSalesChannels(): SalesChannel[] {
  const prefs = getPreferences();
  if (prefs?.salesChannels.length) return [...prefs.salesChannels];
  return [...DEFAULT_SALES_CHANNELS];
}

export function getEffectiveOtherChannelLabel(): string | undefined {
  return getPreferences()?.otherChannelLabel;
}
