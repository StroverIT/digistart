import type { Metadata } from "next";
import { TemplatesGallery } from "@/components/templates/templates-gallery";
import { productCategories, storeTemplates } from "@/lib/data/templates";

export const metadata: Metadata = {
  title: "Шаблони за онлайн магазин",
  description:
    "Разгледай готовите шаблони за онлайн магазин - дрехи, козметика и още. Виж live преглед и избери дизайн за твоя бизнес.",
};

export default function TemplatesPage() {
  return <TemplatesGallery categories={productCategories} templates={storeTemplates} />;
}
