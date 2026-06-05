export type ProductCategory = "clothing" | "cosmetics" | "food" | "other";

export type TemplateCategoryFilter = ProductCategory | "all";

export type TemplateDetailSection = {
  title: string;
  items: string[];
};

export type TemplateNicheId =
  | "clothes"
  | "shoes"
  | "snacks"
  | "jewelry"
  | "bags"
  | "cosmetics"
  | "beauty-health"
  | "bikes-scooters"
  | "home-fitness"
  | "camping"
  | "supplements"
  | "electronics"
  | "ebooks";

export const TEMPLATE_NICHES: { id: TemplateNicheId; label: string }[] = [
  { id: "clothes", label: "Дрехи" },
  { id: "shoes", label: "Обувки" },
  { id: "snacks", label: "Снаксове" },
  { id: "jewelry", label: "Бижута" },
  { id: "bags", label: "Чанти" },
  { id: "cosmetics", label: "Козметика" },
  { id: "beauty-health", label: "Продукти за красота и здраве" },
  { id: "bikes-scooters", label: "Велосипеди, тротинетки, колела" },
  { id: "home-fitness", label: "Фитнес уреди за дома" },
  { id: "camping", label: "Къмпинг екипировка" },
  { id: "supplements", label: "Лекарства, хранителни добавки, витамини" },
  { id: "electronics", label: "Компютри, таблети, мобилни телефони и техните аксесоари" },
  { id: "ebooks", label: "e-book електронни книги" },
];

export function getNicheLabels(ids: TemplateNicheId[]): string[] {
  const idSet = new Set(ids);
  return TEMPLATE_NICHES.filter((niche) => idSet.has(niche.id)).map((niche) => niche.label);
}

/** Template id maps 1:1 to niche order (clothing:1 → Дрехи, clothing:2 → Обувки, …). */
export function nicheForTemplateId(id: string): TemplateNicheId {
  const niche = TEMPLATE_NICHES[Number(id) - 1];
  if (!niche) {
    throw new Error(`No niche mapped for template id "${id}"`);
  }
  return niche.id;
}

export interface StoreTemplate {
  id: string;
  category: ProductCategory;
  name: string;
  description: string;
  /** Static screenshot under public/templates/{id}.png */
  previewImagePath: string;
  /** Proxied or live URL for opening the running template (onboarding, tenant preview). */
  previewPath: string;
  demoPath: string;
  tagline?: string;
  goodFor: TemplateNicheId[];
  highlights: TemplateDetailSection;
  navigation: TemplateDetailSection;
  builtWith?: string;
}

export const productCategories: {
  id: ProductCategory;
  name: string;
  enabled: boolean;
}[] = [
    { id: "clothing", name: "Дрехи", enabled: true },
    { id: "cosmetics", name: "Козметика", enabled: true },
    { id: "food", name: "Храни и напитки", enabled: true },
    { id: "other", name: "Друго", enabled: true },
  ];

const defaultBuiltWith =
  "Next.js магазин с бързо зареждане, mobile-first оформление и готови интеграции за плащания и куриери през DigiStart.";

const defaultNavigation: TemplateDetailSection = {
  title: "Как да се ориентираш в шаблона",
  items: [
    "Начало - първо впечатление, промоции и водещи продукти",
    "Магазин / Колекции - разглеждане на продукти по категории",
    "Продукт - детайли, снимки, варианти и добавяне в количката",
    "Количка - преглед на поръчката преди плащане",
    "Поръчка - данни за доставка и избор на начин на плащане",
    "За нас / Контакти - история на марката и доверие",
  ],
};

const defaultHighlights: TemplateDetailSection = {
  title: "Какво включва",
  items: [
    "Начална страница с hero зона и акцент върху ключовите продукти",
    "Каталог с колекции и филтри",
    "Продуктова страница с галерия и ясен бутон за поръчка",
    "Количка и checkout с наложен платеж и опция за карта",
    "Интеграции с Еконт и Спиди за товарителници с един клик",
    "Вграден Meta Pixel за реклами, когато си готов да мащабираш",
  ],
};

function storeTemplate(
  id: string,
  fields: Pick<StoreTemplate, "name" | "tagline" | "description"> &
    Partial<Pick<StoreTemplate, "goodFor" | "highlights" | "navigation" | "builtWith">>,
): StoreTemplate {
  return {
    id,
    category: "clothing",
    previewImagePath: `/templates/${id}.png`,
    previewPath: `/preview/clothing/${id}`,
    demoPath: `/templates/clothing/${id}`,
    builtWith: defaultBuiltWith,
    highlights: defaultHighlights,
    navigation: defaultNavigation,
    goodFor: fields.goodFor ?? [nicheForTemplateId(id)],
    ...fields,
  };
}

export const storeTemplates: StoreTemplate[] = [
  storeTemplate("1", {
    name: "Луксозен бутик",
    tagline: "Премиум витрина с чисти линии",
    description:
      "Елегантен, минималистичен стил с акцент върху визуалната история, колекциите и премиум усещане.",
    highlights: {
      title: "Какво включва",
      items: [
        "Начална страница с hero зона и акцент върху водещата колекция",
        "Каталог с колекции и филтри",
        "Продуктова страница с галерия и ясен бутон за поръчка",
        "Количка и checkout с наложен платеж и опция за карта",
        "Интеграции с Еконт и Спиди за товарителници с един клик",
        "Вграден Meta Pixel за реклами, когато си готов да мащабираш",
      ],
    },
  }),
  storeTemplate("2", {
    name: "REWEAR",
    tagline: "Топъл, устойчив характер",
    description:
      "Уютен, автентичен стил с ясни категории, истории зад продуктите и лесен път към поръчка.",
  }),
  storeTemplate("3", {
    name: "ReBrew Vintage",
    tagline: "Куриран винтидж с характер",
    description:
      "Витрина с акцент върху уникалността, курираните находки и доверието в качеството.",
  }),
  storeTemplate("4", {
    name: "ReBrew Select",
    tagline: "Структуриран каталог с ясност",
    description:
      "Четим, организиран layout с ясни категории, състояния/варианти и бърз път към поръчка.",
  }),
  storeTemplate("5", {
    name: "ReBrew Curated",
    tagline: "Editorial storytelling",
    description:
      "Елегантен layout с големи снимки, колекции по стил и сезон и editorial усещане.",
  }),
  storeTemplate("6", {
    name: "ReBrew Thrift",
    tagline: "Динамичен каталог · бърз оборот",
    description:
      "Енергичен, мобилен стил за често нови артикули, ясни етикети и лесна навигация.",
  }),
  storeTemplate("7", {
    name: "OutletMark",
    tagline: "Промоционална витрина · ясни оферти",
    description:
      "Стил с акцент върху намаленията, промо зоните и бързи покупки от рекламен трафик.",
    highlights: {
      title: "Какво включва",
      items: [
        "Hero зони с процентни намаления и крайни дати",
        "Каталог с филтри по марка, вариант и отстъпка",
        "Продуктова страница с оригинална и промо цена",
        "Количка и checkout с наложен платеж и карта",
        "Интеграции с Еконт и Спиди",
        "Готов за Meta реклами при старт на кампании",
      ],
    },
  }),
  storeTemplate("8", {
    name: "Reduced",
    tagline: "Директен outlet · ясни цени",
    description:
      "Директен, без излишни стъпки дизайн - сравнение на цени, промо блокове и бърз checkout.",
    highlights: {
      title: "Какво включва",
      items: [
        "Промо ленти и блокове с топ оферти",
        "Списъци продукти с видима спестена сума",
        "Бърз избор на вариант и добавяне в количката",
        "Checkout с наложен платеж и карта",
        "Доставки с Еконт и Спиди",
        "Meta Pixel за проследяване на кампании",
      ],
    },
  }),
  storeTemplate("9", {
    name: "IVL",
    tagline: "Минимализъм · спокойна елегантност",
    description:
      "Минималистичен стил с чисти линии, премиум усещане и спокойна визия без шум.",
    highlights: {
      title: "Какво включва",
      items: [
        "Hero зона с търсене и водещи CTA",
        "Категории и избрани продукти с етикети „Ново“ и намаления",
        "Ясна продуктова страница с галерия",
        "Секция „Как работи“ - поръчка, подготовка и доставка",
        "Checkout с наложен платеж и карта · Еконт и Спиди",
        "Meta Pixel за проследяване на кампании",
      ],
    },
  }),
  storeTemplate("10", {
    name: "Градска линия",
    tagline: "Съвременен · енергичен",
    description:
      "Съвременен стил със силни визуали, ясни колекции и бърз път от разглеждане към поръчка.",
  }),
  storeTemplate("11", {
    name: "Класик & комфорт",
    tagline: "Timeless · четим и спокоен",
    description:
      "Спокоен, четим шаблон с акцент върху доверието в марката, материалите и удобството при покупка.",
  }),
  storeTemplate("12", {
    name: "PowerUp",
    tagline: "Технологична витрина · ясни категории",
    description:
      "Съвременен магазин за електроника с категории, промо зони, марки и бърз път от разглеждане към поръчка.",
    highlights: {
      title: "Какво включва",
      items: [
        "Hero зона с категории и водещи продукти",
        "Секции за най-продавани и последни продукти",
        "Продуктова страница с цени, отстъпки и ясен CTA",
        "Количка и checkout с наложен платеж и карта",
        "Интеграции с Еконт и Спиди",
        "Meta Pixel за проследяване на рекламни кампании",
      ],
    },
  }),
  storeTemplate("13", {
    name: "Bokify",
    tagline: "Премиум дигитална библиотека",
    description:
      "Модерен магазин за електронни книги с търсене по заглавие и жанр, ясни категории и мигновена доставка на EPUB, PDF и MOBI.",
    navigation: {
      title: "Как да се ориентираш в шаблона",
      items: [
        "Начало - hero зона, нови заглавия и търсене",
        "Магазин / Жанрове - разглеждане по категории",
        "Продукт - детайли за книга, формати и добавяне в количката",
        "Количка - преглед преди плащане",
        "Поръчка - данни и избор на начин на плащане",
        "За нас / Блог - доверие и съдържание",
      ],
    },
    highlights: {
      title: "Какво включва",
      items: [
        "Hero зона с търсене по заглавие, автор или жанр",
        "Жанрови категории - фантастика, трилър, роман и други",
        "Продуктова страница с формати, мигновено изтегляне и без DRM",
        "Количка и checkout с карта",
        "Meta Pixel за проследяване на рекламни кампании",
      ],
    },
  }),
];

export function getTemplate(category: string, id: string): StoreTemplate | undefined {
  return storeTemplates.find((t) => t.category === category && t.id === id);
}

/** Resolves a template during onboarding (all catalog templates are under clothing). */
export function getTemplateForOnboarding(
  productCategory: string,
  id: string,
): StoreTemplate | undefined {
  return getTemplate(productCategory, id) ?? getTemplate("clothing", id);
}

/** Templates shown in onboarding - same clothing catalog for every product category. */
export function getOnboardingTemplates(_productCategory?: string): StoreTemplate[] {
  return storeTemplates;
}

export function getTemplatesByCategory(category: ProductCategory): StoreTemplate[] {
  return storeTemplates.filter((t) => t.category === category);
}

export function getTemplatesByCategoryFilter(
  category: TemplateCategoryFilter,
): StoreTemplate[] {
  if (category === "all") return storeTemplates;
  return getTemplatesByCategory(category);
}

export function getTemplateDetailPath(category: string, id: string): string {
  return `/templates/${category}/${id}`;
}

/** Latest templates by catalog order (newest last in array). */
export function getLatestTemplates(count = 3): StoreTemplate[] {
  return storeTemplates.slice(-count).reverse();
}
