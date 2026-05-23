import type { Service, ServiceUpsell } from "@/lib/types";

/** Shared checkout/cart upsells: logo design + color palette (per plan). */
export const brandUpsells: ServiceUpsell[] = [
  {
    id: "logo-design",
    name: "Изработка на лого",
    description: "Професионален дизайн на лого спрямо твоя бранд.",
    kind: "toggle",
    pricePerUnit: 50,
    unit: "добавка",
    min: 0,
    max: 1,
    default: 0,
  },
];

export const services: Service[] = [
  {
    id: "ready-store",
    slug: "online-store",
    name: "Онлайн Магазин",
    description:
      "Абонаментен онлайн магазин с готов темплейт, приемане на поръчки и вграден Meta Pixel. Стандартна настройка за 1 работен ден.",
    icon: "ShoppingCart",
    basePrice: 20,
    isMonthly: true,
    options: [
      {
        id: "subscription",
        name: "Абонаментен онлайн магазин",
        description:
          "Готов темплейт, поръчки, Meta Pixel и мобилна версия",
        price: 20,
        isMonthly: true,
      },
    ],
    upsells: [
      {
        id: "online-payments",
        name: "Плащане с карта",
        description:
          "Сигурни картови плащания, включително Apple Pay и Google Pay. Скоро: DSK Bank и Борика.",
        kind: "toggle",
        isMonthly: true,
        pricePerUnit: 10,
        unit: "месец",
        min: 0,
        max: 1,
        default: 0,
      },
      {
        id: "courier-integration",
        name: "Интеграция с куриер",
        description:
          "Еконт или Спиди с избор на офис и автоматично изчисляване на доставка. Скоро: Box Now и Easybox.",
        kind: "choice",
        isMonthly: true,
        unit: "куриер",
        min: 0,
        max: 1,
        default: 0,
        choices: [
          { id: "econt", name: "Еконт", pricePerUnit: 5, isMonthly: true },
          { id: "speedy", name: "Спиди", pricePerUnit: 5, isMonthly: true },
        ],
      },
      {
        id: "unique-design",
        name: "Уникален дизайн",
        description:
          "Индивидуален дизайн по твоя бранд. Срок: 3–5 работни дни според нишата.",
        kind: "toggle",
        pricePerUnit: 100,
        unit: "еднократно",
        min: 0,
        max: 1,
        default: 0,
      },
      ...brandUpsells,
    ],
    features: [
      "Готов темплейт за магазин",
      "Приемане на поръчки",
      "Вграден Meta Pixel",
      "Мобилна версия (Responsive)",
      "Настройка за 1 работен ден",
    ],
    timeline: "1 работен ден",
  },
  {
    id: "google-business",
    slug: "google-business",
    name: "Google Business",
    description:
      "Помагаме ви да се класирате по-високо в Google Maps и локалните търсения.",
    icon: "MapPin",
    basePrice: 49,
    options: [
      {
        id: "basic",
        name: "Профил в Google Business",
        description: "Еднократна настройка и оптимизация на профила",
        price: 49,
      },
    ],
    upsells: [
      {
        id: "monthly-posts",
        name: "Месечна поддръжка и публикации",
        description:
          "По 2 оптимизирани поста месечно директно в Google профила.",
        kind: "toggle",
        isMonthly: true,
        pricePerUnit: 32,
        unit: "месец",
        min: 0,
        max: 1,
        default: 0,
      },
      {
        id: "review-removal",
        name: "Процедура по премахване на фалшиви ревюта",
        description: "Официални рапорти и жалби към Google support.",
        kind: "toggle",
        isMonthly: true,
        pricePerUnit: 32,
        unit: "месец",
        min: 0,
        max: 1,
        default: 0,
      },
      {
        id: "apple-maps",
        name: "Синхронизация с Apple Maps",
        description: "Създаване и оптимизация на бизнес профил в Apple.",
        kind: "toggle",
        pricePerUnit: 49,
        unit: "добавка",
        min: 0,
        max: 1,
        default: 0,
      },
      {
        id: "gps-package",
        name: "GPS пакет (Waze, TomTom, Here WeGo)",
        description: "Добавяне на бизнеса в популярни автомобилни навигации.",
        kind: "toggle",
        pricePerUnit: 36,
        unit: "пакет",
        min: 0,
        max: 1,
        default: 0,
      },
      {
        id: "bing-yahoo",
        name: "Регистрация в Bing Places & Yahoo Local",
        description: "Дублиране и оптимизация в търсачката на Microsoft.",
        kind: "toggle",
        pricePerUnit: 20,
        unit: "добавка",
        min: 0,
        max: 1,
        default: 0,
      },
      {
        id: "digital-menu",
        name: "Дигитално меню / продуктов каталог",
        description:
          "Първите 15 продукта безплатно. След това €0.20 на артикул.",
        kind: "quantity",
        pricePerUnit: 0.2,
        unit: "продукт",
        min: 0,
        max: 10000,
        default: 0,
        includedUnits: 15,
      },
      {
        id: "second-location",
        name: "Добавяне на втора локация (филиал)",
        description: "Добавяме и верифицираме втори обект.",
        kind: "toggle",
        pricePerUnit: 24,
        unit: "локация",
        min: 0,
        max: 1,
        default: 0,
      },
      ...brandUpsells,
    ],
    features: [
      "Пълна настройка на профила",
      "Оптимизация за локално SEO",
      "Редовни публикации (с добавка)",
      "Управление на отзиви",
    ],
    timeline: "Еднократна настройка",
  },
  {
    id: "social-media",
    slug: "social-media",
    name: "Социални мрежи",
    description:
      "Създаваме съдържание и управляваме присъствието ви в социалните мрежи.",
    icon: "Share2",
    basePrice: 200,
    isMonthly: true,
    options: [
      {
        id: "default",
        name: "Базов маркетинг пакет",
        description: "2 публикации седмично за 1 канал",
        price: 200,
        isMonthly: true,
      },
    ],
    upsells: [
      {
        id: "extra-posts",
        name: "Допълнителни публикации",
        description: "Всеки допълнителен пост / carousel / reel - €10 за канала.",
        kind: "quantity",
        isMonthly: true,
        pricePerUnit: 10,
        unit: "пост",
        min: 0,
        max: 100,
        default: 0,
      },
      {
        id: "extra-channels",
        name: "Допълнителни канали",
        description: "€99/месец на канал, включва 2 публикации седмично.",
        kind: "quantity",
        isMonthly: true,
        pricePerUnit: 99,
        unit: "канал",
        min: 0,
        max: 10,
        default: 0,
      },
      {
        id: "welcome-messages",
        name: "Автоматични приветствени съобщения",
        description: "Автоматично лично съобщение за всеки нов последовател.",
        kind: "toggle",
        pricePerUnit: 20,
        unit: "добавка",
        min: 0,
        max: 1,
        default: 0,
      },
      {
        id: "chatbot-setup",
        name: "Настройка на Чатбот",
        description: "Чатбот за автоматични отговори на типични запитвания.",
        kind: "toggle",
        pricePerUnit: 59,
        unit: "добавка",
        min: 0,
        max: 1,
        default: 0,
      },
      ...brandUpsells,
    ],
    features: [
      "Създаване на съдържание",
      "Визуален дизайн на постове",
      "Планиране и публикуване",
      "2 публикации седмично (1 канал)",
    ],
    timeline: "Постоянна услуга",
  },
  {
    id: "ads",
    slug: "ads",
    name: "Реклами",
    description:
      "Настройваме и управляваме платени реклами в социалните мрежи, за да достигнеш до правилните клиенти.",
    icon: "Megaphone",
    basePrice: 150,
    isMonthly: true,
    options: [
      {
        id: "default",
        name: "Управление на реклами",
        description:
          "€150/месец на канал. Минимален рекламен бюджет: €50/месец на канал.",
        price: 150,
        isMonthly: true,
      },
    ],
    upsells: [
      {
        id: "extra-ad-channels",
        name: "Допълнителни канали",
        description:
          "€150/месец на допълнителен канал за управление на реклами.",
        kind: "quantity",
        isMonthly: true,
        pricePerUnit: 150,
        unit: "канал",
        min: 0,
        max: 10,
        default: 0,
        helperText: "Минималният рекламен бюджет е €50/месец за всеки канал.",
      },
    ],
    features: [
      "Настройка и оптимизация на кампании",
      "Таргетиране към правилната аудитория",
      "Месечни отчети за резултатите",
      "Минимален бюджет €50/месец на канал",
    ],
    timeline: "Постоянна услуга",
  },
];

const LEGACY_SERVICE_SLUGS: Record<string, string> = {
  "\u043e\u043d\u043b\u0430\u0439\u043d-\u043c\u0430\u0433\u0430\u0437\u0438\u043d": "online-store",
  "\u0441\u043e\u0446\u0438\u0430\u043b\u043d\u0438-\u043c\u0440\u0435\u0436\u0438": "social-media",
  "\u0440\u0435\u043a\u043b\u0430\u043c\u0438": "ads",
};

export function resolveServiceSlug(slug: string): string {
  return LEGACY_SERVICE_SLUGS[slug] ?? slug;
}

export function getServiceBySlug(slug: string): Service | undefined {
  const canonical = resolveServiceSlug(slug);
  return services.find((s) => s.slug === canonical);
}

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

export function getServicePlanPrice(service: Service, optionId?: string): number {
  if (optionId) {
    const match = service.options.find((o) => o.id === optionId);
    if (match) return match.price;
  }
  const first = service.options[0];
  return first?.price ?? service.basePrice;
}
