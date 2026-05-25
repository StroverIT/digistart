export const VISITOR_PREFERENCES_VERSION = 1 as const;

export type SalesChannel = "instagram" | "facebook" | "olx" | "other";

export type VisitorServiceId =
  | "online-store"
  | "social-media"
  | "ads"
  | "google-business";

export type MonthlyOrderVolume = "0-10" | "10-50" | "50-100" | "100+";

export type SurveyQuestionId =
  | "sales_channels"
  | "monthly_orders"
  | "service_interest";

export type VisitorPreferencesV1 = {
  version: typeof VISITOR_PREFERENCES_VERSION;
  salesChannels: SalesChannel[];
  otherChannelLabel?: string;
  monthlyOrders: MonthlyOrderVolume;
  selectedServices: VisitorServiceId[];
  primaryService: VisitorServiceId;
  completedAt: string;
};
