"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { READY_STORE_SECTION_NAV } from "./section-nav";

const InnerNavigation = () => {
  const navRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState<string>(READY_STORE_SECTION_NAV[0].id);

  return (
    <nav
      ref={navRef}
      aria-label="Навигация по секции"
      className="sticky top-24 sm:top-28 z-30 mx-auto w-fit max-w-[calc(100%-2rem)] rounded-full border border-border/80 bg-background/90 backdrop-blur-md will-change-transform -mt-14"
    >
      <div className="scrollbar-none flex gap-1 overflow-x-auto px-3 py-2 sm:px-4 sm:py-2.5">
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
          <a href="#buy-now">Купи сега</a>
        </Button>
      </div>
    </nav>
  );
};

export default InnerNavigation;
