"use client";

import { NicheRecommendationDialog } from "@/components/templates/niche-recommendation-dialog";
import { TemplateCard } from "@/components/templates/template-card";
import type { StoreTemplate } from "@/lib/data/templates";

type TemplatesGalleryProps = {
  templates: StoreTemplate[];
};

export function TemplatesGallery({ templates }: TemplatesGalleryProps) {
  return (
    <main className="pt-24 pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <header className="mb-8 md:mb-10 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-balance">
            Шаблони за <span className="gradient-text">онлайн магазин</span>
          </h1>
          <p className="mt-3 text-muted-foreground text-lg leading-relaxed">
            Разгледай готовите стилове, виж как изглеждат на живо и избери визия, която ти пасва.
            След това я адаптираме към твоите продукти и бизнес.
          </p>
          <div className="mt-6">
            <NicheRecommendationDialog />
          </div>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          {templates.map((template) => (
            <TemplateCard key={`${template.category}-${template.id}`} template={template} />
          ))}
        </div>
      </div>
    </main>
  );
}
