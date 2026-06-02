"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { READY_STORE_SECTION_NAV } from "./section-nav";

const InnerNavigation = () => {
  const [activeId, setActiveId] = useState<string>(READY_STORE_SECTION_NAV[0].id);

  useEffect(() => {
    const sectionIds = READY_STORE_SECTION_NAV.map((item) => item.id);
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
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeId === item.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
};

export default InnerNavigation;
