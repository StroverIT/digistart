"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { READY_STORE_SECTION_NAV } from "./section-nav";

const InnerNavigation = () => {
  const [activeId, setActiveId] = useState<string>(READY_STORE_SECTION_NAV[0].id);

  useEffect(() => {
    const sectionIds = [
      ...READY_STORE_SECTION_NAV.map((item) => item.id),
      "buy-now",
    ];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (activeId === "buy-now") return null;

  return (
    <nav
      aria-label="Навигация по секции"
      className="sticky top-24 sm:top-28 z-30 border-y border-border/80 bg-background/90 backdrop-blur-md"
    >
      <div className="scrollbar-none mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-3 sm:px-6 sm:justify-center">
        {READY_STORE_SECTION_NAV.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={() => setActiveId(item.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors",
              activeId === item.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </a>
        ))}
        <Button
          asChild
          variant="default"
          size="sm"
          className="shrink-0 rounded-full uppercase"
        >
          <a href="#buy-now" onClick={() => setActiveId("buy-now")}>
            Купи сега
          </a>
        </Button>
      </div>
    </nav>
  );
};

export default InnerNavigation;
