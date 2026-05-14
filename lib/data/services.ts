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
  {
    id: "color-palette",
    name: "Цветова палитра и бранд гайд",
    description: "Съгласувана цветова палитра + типография.",
    kind: "toggle",
    pricePerUnit: 20,
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
    shortDescription:
      "Продавай веднага с професионален магазин, настроен специално за твоя бизнес. Без скрити такси.",
    fullDescription:
      "Продуктизиран пакет за бърз старт: индивидуален дизайн, продукти, плащания и мобилна версия — до 48 часа до първи клиенти.",
    icon: "ShoppingCart",
    basePrice: 750,
    options: [
      {
        id: "standard",
        name: "Онлайн Магазин",
        description:
          "Пълен пакет: дизайн с лого, продукти, плащания, SEO и хостинг за първия месец",
        price: 750,
      },
    ],
    upsells: [
      {
        id: "pro-package",
        name: "ПРО Пакет: Куриери + Плащания с карта",
        description:
          "Комбиниран пакет с интеграция на Еконт + Спиди и картови плащания на по-добра цена.",
        kind: "toggle",
        pricePerUnit: 160,
        unit: "пакет",
        min: 0,
        max: 1,
        default: 0,
      },
      {
        id: "monthly-maintenance",
        name: "Месечна поддръжка и сигурност",
        description:
          "Премиум хостинг, ежедневни архиви, ъпдейти и мониторинг за безпроблемна работа на магазина.",
        kind: "toggle",
        isMonthly: true,
        pricePerUnit: 100,
        unit: "месец",
        min: 0,
        max: 1,
        default: 0,
      },
      {
        id: "online-payments",
        name: "Онлайн плащания с карта (Stripe / MyPOS)",
        description:
          "Интегрираме сигурна система за картови плащания, включително Apple Pay и Google Pay.",
        kind: "toggle",
        pricePerUnit: 90,
        unit: "добавка",
        min: 0,
        max: 1,
        default: 0,
      },
      {
        id: "express-delivery",
        name: "Експресна изработка до 48 часа",
        description:
          "Онлайн магазинът става основен приоритет с гарантиран старт до 48 часа след поръчката.",
        kind: "toggle",
        pricePerUnit: 200,
        unit: "добавка",
        min: 0,
        max: 1,
        default: 0,
      },
      {
        id: "sales-booster",
        name: 'Модул "Увеличи продажбите" (Upsell & Cross-sell)',
        description:
          "Функции като често купувани заедно и bundle оферти за по-висока средна стойност на поръчка.",
        kind: "toggle",
        pricePerUnit: 85,
        unit: "добавка",
        min: 0,
        max: 1,
        default: 0,
      },
      {
        id: "courier-integration",
        name: "Интеграция с куриери",
        description:
          "Настройка на Еконт/Спиди с избор на офис по карта и автоматично изчисляване на доставка.",
        kind: "choice",
        unit: "пакет",
        min: 0,
        max: 1,
        default: 0,
        choices: [
          { id: "econt", name: "Само Еконт", pricePerUnit: 85 },
          { id: "speedy", name: "Само Спиди", pricePerUnit: 85 },
          { id: "both", name: "Еконт + Спиди", pricePerUnit: 140 },
        ],
      },

      {
        id: "pixel-analytics",
        name: "Facebook Pixel + Google Analytics",
        description:
          "Инсталация и базова конфигурация за точно проследяване на трафик, събития и конверсии.",
        kind: "toggle",
        pricePerUnit: 67,
        unit: "добавка",
        min: 0,
        max: 1,
        default: 0,
      },
      {
        id: "extra-products",
        name: "Допълнителни продукти над 500",
        description:
          "Базовият пакет включва 500 продукта. За повече се таксуват 0.05 евро на продукт (50 евро на 1000).",
        kind: "quantity",
        pricePerUnit: 0.05,
        unit: "продукт",
        min: 0,
        max: 50000,
        default: 0,
      },
      {
        id: "ecommerce-legal-package",
        name: "Правен пакет за Електронна Търговия",
        description:
          "Шаблони и настройка на общи условия, политика за поверителност и бисквитки за онлайн магазин.",
        kind: "toggle",
        pricePerUnit: 90,
        unit: "пакет",
        min: 0,
        max: 1,
        default: 0,
      },
      ...brandUpsells,
    ],
    features: [
      "Индивидуален дизайн с твоето лого",
      "Качване и настройка на до 500 продукта",
      "Интеграция на методи за плащане (Stripe/Наложен платеж)",
      "Мобилна версия (Responsive design)",
      "Основни SEO настройки",
      "Безплатен хостинг за първия месец",
    ],
    timeline: "До 48 часа",
  },
  {
    id: "google-business",
    slug: "google-business",
    name: "Google Business",
    shortDescription: "Оптимизация и управление на вашия Google Business профил за повече видимост в търсачката.",
    fullDescription: "Помагаме ви да се класирате по-високо в Google Maps и локалните търсения. Оптимизираме профила ви, публикуваме редовно съдържание и отговаряме на отзиви, за да изградите доверие с клиентите.",
    icon: "MapPin",
    basePrice: 20,
    options: [
      {
        id: "basic",
        name: "Профил в Google Business",
        description: "Еднократна настройка и оптимизация на профила",
        price: 11,
      },
    ],
    upsells: [
      {
        id: "monthly-posts",
        name: "Месечна поддръжка и публикации",
        description:
          "По 2 оптимизирани поста месечно директно в Google профила, за да останеш активен.",
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
        description: "Създаване и оптимизация на бизнес профил и в екосистемата на Apple.",
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
        description: "Дублиране и оптимизация на профила и в търсачката на Microsoft.",
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
          "Включва въвеждане до 15 продукта или 3 услуги. След това се таксуват по 0.20 евро на артикул или услуга.",
        kind: "quantity",
        pricePerUnit: 0.2,
        unit: "продукт",
        min: 0,
        max: 10000,
        default: 0,
        includedUnits: 15,
      },
      {
        id: "review-removal",
        name: "Процедура по премахване на фалшиви ревюта",
        description: "Официални рапорти и жалби към Google support с аргументация.",
        kind: "toggle",
        isMonthly: true,
        pricePerUnit: 32,
        unit: "месец",
        min: 0,
        max: 1,
        default: 0,
      },
      {
        id: "second-location",
        name: "Добавяне на втора локация (филиал)",
        description: "Добавяме и верифицираме втори обект на преференциална цена.",
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
      "Редовни публикации",
      "Управление на отзиви",
      "Месечни отчети",
      "Конкурентен анализ",
    ],
    timeline: "Постоянна услуга",
  },
  {
    id: "social-media",
    slug: "social-media",
    name: "Социални мрежи",
    shortDescription: "Професионално управление на вашите социални мрежи за повече ангажираност и продажби.",
    fullDescription: "Създаваме съдържание, което привлича внимание и генерира ангажираност. От визуални постове до рекламни кампании - управляваме цялостното ви присъствие в социалните мрежи.",
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
        description:
          "Всеки допълнителен пост / carousel / reel струва 10 евро за текущия канал.",
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
        description: "99 евро/месец на канал, като включва 2 публикации седмично за този канал.",
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
        description: "Всеки нов последовател получава автоматично топло лично съобщение.",
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
        description:
          'В стандартния пакет ние модерираме коментарите и следим за спам. Отговарянето на конкретни търговски запитвания (напр. "Кога имате свободен час?" или "Имате ли този модел в червено?") остава твоя задача, тъй като ти познаваш наличностите и графика си най-добре. С тази добавка настройваме чатбот за автоматични отговори на типични запитвания.',
        kind: "toggle",
        pricePerUnit: 59,
        unit: "добавка",
        min: 0,
        max: 1,
        default: 0,
      },
      {
        id: "ad-management",
        name: "Управление на реклами",
        description:
          "150 евро/месец на канал за управление на реклами. Минимален бюджет за реклама: 50 евро/месец на канал.",
        kind: "quantity",
        isMonthly: true,
        pricePerUnit: 150,
        unit: "месец",
        min: 0,
        max: 10,
        default: 0,
        helperText: "Минималният рекламен бюджет е 50 евро/месец за всеки избран канал.",
      },
      ...brandUpsells,
    ],
    features: [
      "Създаване на съдържание",
      "Визуален дизайн на постове",
      "Планиране и публикуване",
      "Отговори на коментари",
      "Месечни отчети",
      "Стратегия за растеж",
    ],
    timeline: "Постоянна услуга",
  },
];

/** Historical slug values (e.g. in DB) → canonical Latin slugs. */
const LEGACY_SERVICE_SLUGS: Record<string, string> = {
  "\u043e\u043d\u043b\u0430\u0439\u043d-\u043c\u0430\u0433\u0430\u0437\u0438\u043d": "online-store",
  "\u0441\u043e\u0446\u0438\u0430\u043b\u043d\u0438-\u043c\u0440\u0435\u0436\u0438": "social-media",
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

/** Base plan price for marketing UI: matches the selected option when provided, otherwise the first option, else `basePrice`. */
export function getServicePlanPrice(service: Service, optionId?: string): number {
  if (optionId) {
    const match = service.options.find((o) => o.id === optionId);
    if (match) return match.price;
  }
  const first = service.options[0];
  return first?.price ?? service.basePrice;
}
