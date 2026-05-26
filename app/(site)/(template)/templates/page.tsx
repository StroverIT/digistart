import type { Metadata } from "next";
import { TemplatesGallery } from "@/components/templates/templates-gallery";
import { storeTemplates } from "@/lib/data/templates";

export const metadata: Metadata = {
  title: "Шаблони за онлайн магазин",
  description:
    "Разгледай готовите стилове за онлайн магазин. Виж live преглед, избери визия и я адаптираме към твоите продукти и бизнес нужди.",
};

export default function TemplatesPage() {
  return <TemplatesGallery templates={storeTemplates} />;
}
