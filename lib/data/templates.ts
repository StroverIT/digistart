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

const clothingBuiltWith =
  "Next.js магазин с бързо зареждане, mobile-first оформление и готови интеграции за плащания и куриери през DigiStart.";

const clothingNavigation: TemplateDetailSection = {
  title: "Как да се ориентираш в шаблона",
  items: [
    "Начало — първо впечатление, промоции и водеща колекция",
    "Магазин / Колекции — разглеждане на продукти по категории",
    "Продукт — детайли, снимки, избор на размер и добавяне в количката",
    "Количка — преглед на поръчката преди плащане",
    "Поръчка — данни за доставка и избор на начин на плащане",
    "За нас / Контакти — история на марката и доверие",
  ],
};

const clothingHighlights: TemplateDetailSection = {
  title: "Какво включва",
  items: [
    "Начална страница с hero зона и акцент върху ключовите продукти",
    "Каталог с колекции, филтри по размер и цвят",
    "Продуктова страница с галерия, размери и ясен бутон за поръчка",
    "Количка и checkout с наложен платеж и опция за карта",
    "Интеграции с Еконт и Спиди за товарителници с един клик",
    "Вграден Meta Pixel за реклами, когато си готов да мащабираш",
  ],
};

function clothingTemplate(
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
    builtWith: clothingBuiltWith,
    highlights: clothingHighlights,
    navigation: clothingNavigation,
    ...fields,
  };
}

export const storeTemplates: StoreTemplate[] = [
  clothingTemplate("1", {
    name: "Луксозен бутик",
    tagline: "Премиум витрина за модни марки и бутици",
    description:
      "Чист дизайн за модни дрехи с акцент върху колекциите, качествени материали и силна визуална история.",
    audience: {
      title: "За кого е подходящ",
      items: [
        "Бутици и марки за дрехи, които искат премиум онлайн присъствие",
        "Магазини с колекции и сезонни кампании",
        "Бизнеси, които продават и в Instagram, но искат автоматизирани поръчки 24/7",
        "Собственици, които искат да изглеждат професионално без агенция за десетки хиляди лева",
      ],
    },
    highlights: {
      title: "Какво включва",
      items: [
        "Начална страница с hero зона и акцент върху новата колекция",
        "Каталог с колекции, филтри по размер и цвят",
        "Продуктова страница с галерия, размери и ясен бутон за поръчка",
        "Количка и checkout с наложен платеж и опция за карта",
        "Интеграции с Еконт и Спиди за товарителници с един клик",
        "Вграден Meta Pixel за реклами, когато си готов да мащабираш",
      ],
    },
  }),
  clothingTemplate("2", {
    name: "REWEAR",
    tagline: "Втора употреба с характер",
    description:
      "Топъл, устойчив магазин за second-hand дрехи — ясни категории, истории на артикулите и бърза поръчка.",
    audience: {
      title: "За кого е подходящ",
      items: [
        "Магазини за дрехи втора употреба и thrift",
        "Брандове с фокус върху устойчива мода и преизползване",
        "Продавачи във Vinted/Instagram, които искат собствен сайт с количка",
        "Стартиращи бизнеси с ограничен бюджет за дизайн",
      ],
    },
  }),
  clothingTemplate("3", {
    name: "ReBrew Vintage",
    tagline: "Куриран винтидж и втора употреба",
    description:
      "Витрина за подбрани винтидж находки с акцент върху уникалността и доверието в качеството.",
    audience: {
      title: "За кого е подходящ",
      items: [
        "Курирани vintage и thrift магазини",
        "Колекционери с малки, но често обновявани серии",
        "Магазини с силна визуална идентичност в социалните мрежи",
        "Търговци, които искат да подчертаят „единствени бройки“",
      ],
    },
  }),
  clothingTemplate("4", {
    name: "ReBrew Select",
    tagline: "Втора употреба с проверено качество",
    description:
      "Структуриран каталог за second-hand с ясни състояния, размери и бърз път към поръчка.",
    audience: {
      title: "За кого е подходящ",
      items: [
        "Магазини, които искат да изглеждат професионално, не като обява",
        "Thrift бизнеси с растящ обем и нужда от филтри",
        "Екипи с няколко източника на стока и нужда от ясни категории",
        "Собственици, които продават онлайн всеки ден",
      ],
    },
  }),
  clothingTemplate("5", {
    name: "ReBrew Curated",
    tagline: "Подбран винтидж с storytelling",
    description:
      "Елегантен layout за курирани находки — големи снимки, колекции по стил и сезон.",
    audience: {
      title: "За кого е подходящ",
      items: [
        "Boutique vintage магазини с по-висока ценова категория",
        "Марки с editorial стил и lookbook усещане",
        "Магазини с лимитирани drops и бързо изчерпване",
        "Продавачи, които искат premium усещане без custom код",
      ],
    },
  }),
  clothingTemplate("6", {
    name: "ReBrew Thrift",
    tagline: "Единствени бройки · бърз оборот",
    description:
      "Динамичен thrift шаблон за често нови артикули, ясни етикети и лесна навигация на мобилно.",
    audience: {
      title: "За кого е подходящ",
      items: [
        "Thrift магазини с висок оборот и много SKU",
        "Екипи, които качват нови продукти всеки ден",
        "Продавачи с фокус върху мобилни поръчки",
        "Бизнеси, които искат минимална поддръжка на сайта",
      ],
    },
  }),
  clothingTemplate("7", {
    name: "OutletMark",
    tagline: "Официален outlet · до -70%",
    description:
      "Outlet витрина с акцент върху намаленията, марките и ясни промо зони за бързи покупки.",
    audience: {
      title: "За кого е подходящ",
      items: [
        "Outlet магазини и разпродажби на маркови дрехи",
        "Търговци с остатъчни количества от сезони",
        "Магазини с агресивни промоции и flash deals",
        "Бизнеси, които искат да конвертират трафик от реклами",
      ],
    },
    highlights: {
      title: "Какво включва",
      items: [
        "Hero зони с процентни намаления и крайни дати",
        "Каталог с филтри по марка, размер и отстъпка",
        "Продуктова страница с оригинална и outlet цена",
        "Количка и checkout с наложен платеж и карта",
        "Интеграции с Еконт и Спиди",
        "Готов за Meta реклами при старт на кампании",
      ],
    },
  }),
  clothingTemplate("8", {
    name: "Reduced",
    tagline: "Outlet · до 70% по-ниски цени",
    description:
      "Директен outlet дизайн — ясни цени, сравнения и път към поръчка без излишни стъпки.",
    audience: {
      title: "За кого е подходящ",
      items: [
        "Онлайн outlet магазини с фокус върху цената",
        "Марки с официален канал за намалени колекции",
        "Магазини с голям обем SKU на промоция",
        "Собственици, които искат бърза конверсия от реклама",
      ],
    },
    highlights: {
      title: "Какво включва",
      items: [
        "Промо ленти и блокове с топ оферти",
        "Списъци продукти с видима спестена сума",
        "Бърз избор на размер и добавяне в количката",
        "Checkout с наложен платеж и карта",
        "Доставки с Еконт и Спиди",
        "Meta Pixel за проследяване на кампании",
      ],
    },
  }),
  clothingTemplate("9", {
    name: "IVL",
    tagline: "Съвременна дамска мода",
    description:
      "Минималистичен шаблон за курирана дамска колекция — чисти линии, премиум материи и спокойна елегантност без визуален шум.",
    audience: {
      title: "За кого е подходящ",
      items: [
        "Дамски бутици и марки с курирани колекции",
        "Магазини с рокли, комплекти, блузи и сезонни категории",
        "Брандове, които искат премиум визия и ясна продуктова история",
        "Собственици, които продават в Instagram и искат професионален онлайн магазин",
      ],
    },
    highlights: {
      title: "Какво включва",
      items: [
        "Hero зона „Стил без шум“ с търсене и водещи CTA",
        "Категории по отдели — рокли, комплекти, блузи, панталони, палта",
        "Избрани продукти с етикети „Ново“ и видими намаления",
        "Секция „Как работи“ — поръчка, подготовка и доставка за 2–4 дни",
        "Checkout с наложен платеж и карта · Еконт и Спиди",
        "Meta Pixel за проследяване на кампании",
      ],
    },
  }),
  clothingTemplate("10", {
    name: "Градска линия",
    tagline: "Streetwear и ежедневна мода",
    description:
      "Съвременен магазин за градски стил — ясни колекции, силни визуали и бърз път от разглеждане към поръчка.",
    audience: {
      title: "За кого е подходящ",
      items: [
        "Streetwear и casual марки с често обновявани колекции",
        "Магазини с фокус върху младата аудитория и социални канали",
        "Бизнеси с много SKU и нужда от чисти категории и филтри",
        "Собственици, които искат модерен сайт без тежка поддръжка",
      ],
    },
  }),
  clothingTemplate("11", {
    name: "Класик & комфорт",
    tagline: "Timeless силуети · ежедневен комфорт",
    description:
      "Спокоен, четим шаблон за базови дрехи и класически силуети — акцент върху материите, размерите и доверието в марката.",
    audience: {
      title: "За кого е подходящ",
      items: [
        "Магазини за essentials, бельо и базови линии",
        "Марки с фокус върху качество, удобство и повторни покупки",
        "Бутици с по-малък каталог и силна продуктова история",
        "Собственици, които искат елегантна витрина без визуален шум",
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
