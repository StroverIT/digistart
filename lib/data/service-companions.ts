import type { ServiceCompanionOfferConfig } from "@/lib/types";
import { ADS_PRICING, formatEuroPrice } from "@/lib/data/ads-pricing";

export const SOCIAL_MEDIA_ADS_COMPANION: ServiceCompanionOfferConfig = {
  serviceId: "ads",
  optionId: "default",
  title: "Управление на реклами",
  description:
    `Добави платени кампании с таргетиране и оптимизация - ${formatEuroPrice(ADS_PRICING.channelManagementMonthly)}/месец на канал (бюджетът към платформите е отделно).`,
  learnMoreHref: "/services/ads",
};

export const ADS_SOCIAL_MEDIA_COMPANION: ServiceCompanionOfferConfig = {
  serviceId: "social-media",
  optionId: "default",
  title: "Социални мрежи - базов пакет",
  description:
    "2 публикации седмично за 1 канал, текстове и стратегия - за да имаш съдържание, което рекламите да водят към профила ти.",
  learnMoreHref: "/services/social-media",
};
