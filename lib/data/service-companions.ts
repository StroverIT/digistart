import type { ServiceCompanionOfferConfig } from "@/lib/types";

export const SOCIAL_MEDIA_ADS_COMPANION: ServiceCompanionOfferConfig = {
  serviceId: "ads",
  optionId: "default",
  title: "Управление на реклами",
  description:
    "Добави платени кампании с таргетиране и оптимизация - €150/месец на канал (бюджетът към платформите е отделно).",
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
