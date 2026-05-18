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

export const storeTemplates: StoreTemplate[] = [
  {
    id: "1",
    category: "clothing",
    name: "Луксозен бутик",
    tagline: "Премиум витрина за модни марки и бутици",
    description:
      "Чист дизайн за модни дрехи с акцент върху колекциите, качествени материали и силна визуална история.",
    previewPath: "/preview/clothing/1",
    demoPath: "/templates/clothing/1",
    builtWith:
      "Next.js магазин с бързо зареждане, mobile-first оформление и готови интеграции за плащания и куриери през DigiStart.",
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
    navigation: {
      title: "Как да се ориентираш в шаблона",
      items: [
        "Начало — първо впечатление, промоции и водеща колекция",
        "Магазин / Колекции — разглеждане на продукти по категории",
        "Продукт — детайли, снимки, избор на размер и добавяне в количката",
        "Количка — преглед на поръчката преди плащане",
        "Поръчка — данни за доставка и избор на начин на плащане",
        "За нас / Контакти — история на марката и доверие",
      ],
    },
  },
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
