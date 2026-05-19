"use client";

import { useMemo, useState } from "react";
import type { ProductCategory, StoreTemplate, TemplateCategoryFilter } from "@/lib/data/templates";
import { TemplateCategorySidebar } from "@/components/templates/template-category-sidebar";
import { TemplateCard } from "@/components/templates/template-card";
import { NicheRecommendationDialog } from "@/components/templates/niche-recommendation-dialog";
import { cn } from "@/lib/utils";

type CategoryItem = {
  id: ProductCategory;
  name: string;
  enabled: boolean;
};

type TemplatesGalleryProps = {
  categories: CategoryItem[];
  templates: StoreTemplate[];
};

export function TemplatesGallery({ categories, templates }: TemplatesGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategoryFilter>("all");

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "all") return templates;
    return templates.filter((t) => t.category === selectedCategory);
  }, [templates, selectedCategory]);

  return (
    <main className="pt-24 pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <header className="mb-8 md:mb-10 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-balance">
            Шаблони за <span className="gradient-text">онлайн магазин</span>
          </h1>
          <p className="mt-3 text-muted-foreground text-lg leading-relaxed">
            Разгледай готовите дизайни, виж как изглеждат на живо и избери шаблон, който пасва на
            твоя бизнес.
          </p>
          <div className="mt-6">
            <NicheRecommendationDialog />
          </div>
        </header>

        <div className="lg:hidden mb-6 -mx-1 overflow-x-auto pb-1">
          <div className="flex gap-2 px-1 min-w-max">
            <CategoryChip
              label="Всички"
              active={selectedCategory === "all"}
              onClick={() => setSelectedCategory("all")}
            />
            {categories.map((cat) => (
              <CategoryChip
                key={cat.id}
                label={cat.enabled ? cat.name : `${cat.name} (скоро)`}
                active={selectedCategory === cat.id}
                disabled={!cat.enabled}
                onClick={() => cat.enabled && setSelectedCategory(cat.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          <aside className="hidden lg:block w-56 shrink-0">
            <TemplateCategorySidebar
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </aside>

          <div className="flex-1 min-w-0">
            <TemplatesGrid templates={filteredTemplates} selectedCategory={selectedCategory} />
          </div>
        </div>
      </div>
    </main>
  );
}

function CategoryChip({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      {label}
    </button>
  );
}

function TemplatesGrid({
  templates,
  selectedCategory,
}: {
  templates: StoreTemplate[];
  selectedCategory: TemplateCategoryFilter;
}) {
  if (templates.length === 0) {
    const categoryName =
      selectedCategory === "all"
        ? "тази категория"
        : selectedCategory === "cosmetics"
          ? "Козметика"
          : selectedCategory === "food"
            ? "Храни и напитки"
            : selectedCategory;

    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
        <p className="text-muted-foreground">
          Все още няма шаблони за {categoryName}. Работим по нови дизайни — следи ни скоро.
        </p>
        <div className="mt-6 flex justify-center">
          <NicheRecommendationDialog />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {templates.map((template) => (
        <TemplateCard key={`${template.category}-${template.id}`} template={template} />
      ))}
    </div>
  );
}
