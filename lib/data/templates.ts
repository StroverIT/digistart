export type ProductCategory = "clothing" | "cosmetics" | "food";

export type TemplateCategoryFilter = ProductCategory | "all";

export type TemplateDetailSection = {
  title: string;
  items: string[];
};

export interface StoreTemplate {
  id: string;
  category: ProductCategory;
  name: string;
  description: string;
  /** Static screenshot under public/templates/{category}/{id}.png */
  previewImagePath: string;
  /** Proxied or live URL for opening the running template (onboarding, tenant preview). */
  previewPath: string;
  demoPath: string;
  tagline?: string;
  audience: TemplateDetailSection;
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
  { id: "cosmetics", name: "Козметика", enabled: false },
  { id: "food", name: "Храни и напитки", enabled: false },
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
  fields: Pick<StoreTemplate, "name" | "tagline" | "description" | "audience"> &
    Partial<Pick<StoreTemplate, "highlights" | "navigation" | "builtWith">>,
): StoreTemplate {
  return {
    id,
    category: "clothing",
    previewImagePath: `/templates/clothing/${id}.png`,
    previewPath: `/preview/clothing/${id}`,
    demoPath: `/templates/clothing/${id}`,
    builtWith: defaultBuiltWith,
    highlights: defaultHighlights,
    navigation: defaultNavigation,
    ...fields,
  };
}

export const storeTemplates: StoreTemplate[] = [
  storeTemplate("1", {
    name: "Луксозен бутик",
    tagline: "Премиум витрина с чисти линии",
    description:
      "Елегантен, минималистичен стил с акцент върху визуалната история, колекциите и премиум усещане.",
    audience: {
      title: "За какъв стил е подходящ",
      items: [
        "Премиум и луксозна визия с много въздух и големи снимки",
        "Марки, които искат да изглеждат професионално и изискано",
        "Колекции и сезонни кампании с силен визуален акцент",
        "Бизнеси, които продават и в социалните мрежи, но искат автоматизирани поръчки 24/7",
      ],
    },
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
    audience: {
      title: "За какъв стил е подходящ",
      items: [
        "Топъл, човешки тон с акцент върху устойчивост и доверие",
        "Магазини с по-лична комуникация и storytelling",
        "Каталози с често нови артикули и ясна навигация",
        "Стартиращи бизнеси, които искат професионален вид без тежък дизайн",
      ],
    },
  }),
  storeTemplate("3", {
    name: "ReBrew Vintage",
    tagline: "Куриран винтидж с характер",
    description:
      "Витрина с акцент върху уникалността, курираните находки и доверието в качеството.",
    audience: {
      title: "За какъв стил е подходящ",
      items: [
        "Курирани колекции с усещане за „единствени бройки“",
        "Силна визуална идентичност в социалните мрежи",
        "По-малки, често обновявани серии продукти",
        "Марки, които искат да подчертаят уникалността на всеки артикул",
      ],
    },
  }),
  storeTemplate("4", {
    name: "ReBrew Select",
    tagline: "Структуриран каталог с ясност",
    description:
      "Четим, организиран layout с ясни категории, състояния/варианти и бърз път към поръчка.",
    audience: {
      title: "За какъв стил е подходящ",
      items: [
        "Професионален вид с фокус върху яснота и структура",
        "Растящи каталози с нужда от филтри и категории",
        "Магазини с много SKU и ежедневни обновления",
        "Собственици, които искат бърза конверсия без визуален шум",
      ],
    },
  }),
  storeTemplate("5", {
    name: "ReBrew Curated",
    tagline: "Editorial storytelling",
    description:
      "Елегантен layout с големи снимки, колекции по стил и сезон и editorial усещане.",
    audience: {
      title: "За какъв стил е подходящ",
      items: [
        "Editorial и lookbook усещане с по-висока ценова категория",
        "Марки с силна визуална история и курирани drops",
        "Лимитирани серии и бързо изчерпващи се колекции",
        "Продавачи, които искат premium усещане без custom код",
      ],
    },
  }),
  storeTemplate("6", {
    name: "ReBrew Thrift",
    tagline: "Динамичен каталог · бърз оборот",
    description:
      "Енергичен, мобилен стил за често нови артикули, ясни етикети и лесна навигация.",
    audience: {
      title: "За какъв стил е подходящ",
      items: [
        "Динамичен каталог с висок оборот и много нови продукти",
        "Екипи, които качват артикули всеки ден",
        "Фокус върху мобилни поръчки и бързо разглеждане",
        "Минимална поддръжка на сайта след старта",
      ],
    },
  }),
  storeTemplate("7", {
    name: "OutletMark",
    tagline: "Промоционална витрина · ясни оферти",
    description:
      "Стил с акцент върху намаленията, промо зоните и бързи покупки от рекламен трафик.",
    audience: {
      title: "За какъв стил е подходящ",
      items: [
        "Агресивни промоции, flash deals и процентни намаления",
        "Магазини с остатъчни количества и сезонни разпродажби",
        "Конверсия от платени реклами и ясни CTA",
        "Витрина, която води директно към поръчка",
      ],
    },
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
    audience: {
      title: "За какъв стил е подходящ",
      items: [
        "Фокус върху цената и видимата спестена сума",
        "Голям обем SKU на промоция",
        "Бърза конверсия от реклама без визуален шум",
        "Ясни промо ленти и топ оферти на началната",
      ],
    },
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
    audience: {
      title: "За какъв стил е подходящ",
      items: [
        "Минимализъм и „стил без шум“ с много бяло пространство",
        "Курирани колекции с ясна продуктова история",
        "Премиум визия за марки, които продават и в Instagram",
        "Секции за доверие - как работи поръчката и доставката",
      ],
    },
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
    audience: {
      title: "За какъв стил е подходящ",
      items: [
        "Модерен, градски вид с често обновявани колекции",
        "Млада аудитория и силно присъствие в социалните мрежи",
        "Големи каталози с нужда от чисти категории и филтри",
        "Модерен сайт без тежка поддръжка след старта",
      ],
    },
  }),
  storeTemplate("11", {
    name: "Класик & комфорт",
    tagline: "Timeless · четим и спокоен",
    description:
      "Спокоен, четим шаблон с акцент върху доверието в марката, материалите и удобството при покупка.",
    audience: {
      title: "За какъв стил е подходящ",
      items: [
        "Класически, timeless визия без визуален шум",
        "По-малки каталози със силна продуктова история",
        "Фокус върху качество, удобство и повторни покупки",
        "Елегантна витрина за essentials и базови линии",
      ],
    },
  }),
];

export function getTemplate(category: string, id: string): StoreTemplate | undefined {
  return storeTemplates.find((t) => t.category === category && t.id === id);
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
