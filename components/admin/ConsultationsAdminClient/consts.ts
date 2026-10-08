import type { TConsultationsAdminTab } from "./types";

export const CONTENT = {
  pageTitleLabel: "Консултации",
  pageDescriptionLabel:
    "Записи от клиенти, ръчни резервации и заключване на часове",
  businessMeetingButtonLabel: "Business meeting",
  bookingsTabLabel: "Записи",
  manualTabLabel: "Ръчна резервация",
  availabilityTabLabel: "Календар",
  bookingsCardTitleSuffixLabel: "записа",
  emptyBookingsLabel: "Няма записани консултации",
  manualCardTitleLabel: "Ръчна резервация",
  availabilityCardTitleLabel: "Наличност и заключвания",
  followUpNotesPrefixLabel: "Продължение от среща",
} as const;

export const DEFAULT_TAB: TConsultationsAdminTab = "bookings";
