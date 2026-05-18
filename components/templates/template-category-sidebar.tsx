"use client";

import type { ProductCategory, TemplateCategoryFilter } from "@/lib/data/templates";
import { trackCtaClick } from "@/lib/analytics/tracker";
import { cn } from "@/lib/utils";

type CategoryItem = {
  id: ProductCategory;
  name: string;
  enabled: boolean;
};

type TemplateCategorySidebarProps = {
  categories: CategoryItem[];
  selected: TemplateCategoryFilter;
  onSelect: (category: TemplateCategoryFilter) => void;
  className?: string;
};

export function TemplateCategorySidebar({
  categories,
  selected,
  onSelect,
  className,
}: TemplateCategorySidebarProps) {
  const handleSelect = (category: TemplateCategoryFilter) => {
    trackCtaClick("/templates", `templates_filter_${category}`);
    onSelect(category);
  };

  return (
    <nav
      aria-label="Филтър по тип магазин"
      className={cn("flex flex-col gap-1", className)}
    >
      <button
        type="button"
        onClick={() => handleSelect("all")}
        aria-current={selected === "all" ? "true" : undefined}
        className={cn(
          "rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors",
          selected === "all"
            ? "bg-primary/10 text-primary border border-primary/20"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        )}
      >
        Всички
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          disabled={!cat.enabled}
          onClick={() => cat.enabled && handleSelect(cat.id)}
          aria-current={selected === cat.id ? "true" : undefined}
          className={cn(
            "rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors",
            selected === cat.id
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            !cat.enabled && "cursor-not-allowed opacity-50",
          )}
        >
          {cat.name}
          {!cat.enabled && (
            <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
              Скоро
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
