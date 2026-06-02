"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { READY_STORE_SECTION_NAV } from "./section-nav";

/** Sticky nav top offset (top-28) plus approximate nav height. */
const SCROLL_SPY_OFFSET = 160;

function getActiveSectionId(): (typeof READY_STORE_SECTION_NAV)[number]["id"] {
  let currentId: (typeof READY_STORE_SECTION_NAV)[number]["id"] =
    READY_STORE_SECTION_NAV[0].id;

  for (const { id } of READY_STORE_SECTION_NAV) {
    const section = document.getElementById(id);
    if (!section) continue;

    if (section.getBoundingClientRect().top <= SCROLL_SPY_OFFSET) {
      currentId = id;
    }
  }

  return currentId;
}

const MOBILE_MEDIA_QUERY = "(max-width: 639px)";

function centerActiveLink(
  container: HTMLElement,
  link: HTMLElement,
) {
  const linkCenter = link.offsetLeft + link.offsetWidth / 2;
  const scrollLeft = linkCenter - container.clientWidth / 2;

  container.scrollTo({
    left: Math.max(0, scrollLeft),
    behavior: "smooth",
  });
}

const InnerNavigation = () => {
  const navRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [activeId, setActiveId] = useState<(typeof READY_STORE_SECTION_NAV)[number]["id"]>(
    READY_STORE_SECTION_NAV[0].id,
  );

  useEffect(() => {
    const container = scrollContainerRef.current;
    const activeLink = linkRefs.current.get(activeId);
    if (!container || !activeLink) return;
    if (!window.matchMedia(MOBILE_MEDIA_QUERY).matches) return;

    centerActiveLink(container, activeLink);
  }, [activeId]);

  useEffect(() => {
    const syncActiveSection = () => {
      setActiveId((previous) => {
        const next = getActiveSectionId();
        return previous === next ? previous : next;
      });
    };

    syncActiveSection();

    const sections = READY_STORE_SECTION_NAV.map(({ id }) =>
      document.getElementById(id),
    ).filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(syncActiveSection, {
      rootMargin: `-${SCROLL_SPY_OFFSET}px 0px -55% 0px`,
      threshold: 0,
    });

    sections.forEach((section) => observer.observe(section));
    window.addEventListener("resize", syncActiveSection);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncActiveSection);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      aria-label="Навигация по секции"
      className="sticky top-24 sm:top-28 z-30 mx-auto w-fit max-w-[calc(100%-2rem)] rounded-full border border-border/80 bg-background/90 backdrop-blur-md will-change-transform -mt-14"
    >
      <div
        ref={scrollContainerRef}
        className="scrollbar-none flex gap-1 overflow-x-auto px-3 py-2 sm:px-4 sm:py-2.5"
      >
        {READY_STORE_SECTION_NAV.map((item) => (
          <a
            key={item.id}
            ref={(element) => {
              if (element) {
                linkRefs.current.set(item.id, element);
              } else {
                linkRefs.current.delete(item.id);
              }
            }}
            href={`#${item.id}`}
            onClick={() => setActiveId(item.id)}
            aria-current={activeId === item.id ? "true" : undefined}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors",
              activeId === item.id
                ? "bg-accent text-accent-foreground"
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
