import type {
  MonthlyOrderVolume,
  SalesChannel,
  VisitorServiceId,
} from "@/lib/visitor-preferences/types";

export const VISITOR_PREFERENCES_STORAGE_KEY = "digistart_visitor_preferences";

export const DEFAULT_SALES_CHANNELS: readonly SalesChannel[] = ["instagram", "facebook"];

export const SALES_CHANNEL_OPTIONS: readonly {
  id: SalesChannel;
  label: string;
}[] = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "olx", label: "OLX" },
  { id: "other", label: "Друго" },
] as const;

export const MONTHLY_ORDER_VOLUME_OPTIONS: readonly {
  id: MonthlyOrderVolume;
  label: string;
}[] = [
  { id: "0-10", label: "0–10" },
  { id: "10-50", label: "10–50" },
  { id: "50-100", label: "50–100" },
  { id: "100+", label: "100+" },
] as const;

export const SERVICE_SURVEY_OPTIONS: readonly {
  id: VisitorServiceId;
  label: string;
  description: string;
}[] = [
  {
    id: "online-store",
    label: "Онлайн магазин",
    description: "Готов магазин за поръчки извън чата",
  },
  {
    id: "ai-automation",
    label: "AI Automation",
    description: "Автоматизирай съобщенията в Instagram",
  },
  {
    id: "ads",
    label: "Реклами",
    description: "Facebook и Instagram реклами",
  },
  {
    id: "social-media",
    label: "Социални мрежи",
    description: "Подредено присъствие и съдържание",
  },
  {
    id: "google-business",
    label: "Google My Business",
    description: "Профил, който изглежда надежден в Google",
  },
] as const;

export const SALES_CHANNEL_LABELS: Record<SalesChannel, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  olx: "OLX",
  other: "друго",
};
