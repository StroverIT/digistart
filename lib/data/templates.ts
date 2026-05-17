export type ProductCategory = "clothing";

export interface StoreTemplate {
  id: string;
  category: ProductCategory;
  name: string;
  description: string;
  previewPath: string;
  demoPath: string;
}

export const productCategories: { id: ProductCategory; name: string; enabled: boolean }[] = [
  { id: "clothing", name: "Дрехи", enabled: true },
];

export const storeTemplates: StoreTemplate[] = [
  {
    id: "1",
    category: "clothing",
    name: "Модерен бутик",
    description: "Чист дизайн за модни дрехи с акцент върху колекциите.",
    previewPath: "/preview/clothing/1",
    demoPath: "/demo/clothing/1",
  },
];

export function getTemplate(category: string, id: string): StoreTemplate | undefined {
  return storeTemplates.find((t) => t.category === category && t.id === id);
}

export function getTemplatesByCategory(category: ProductCategory): StoreTemplate[] {
  return storeTemplates.filter((t) => t.category === category);
}
