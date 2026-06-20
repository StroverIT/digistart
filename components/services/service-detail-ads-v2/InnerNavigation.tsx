"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ADS_SECTION_NAV } from "./section-nav";

const SCROLL_SPY_OFFSET = 160;

function getActiveSectionId(): (typeof ADS_SECTION_NAV)[number]["id"] {
  let currentId: (typeof ADS_SECTION_NAV)[number]["id"] = ADS_SECTION_NAV[0].id;

  for (const { id } of ADS_SECTION_NAV) {
    const section = document.getElementById(id);
    if (!section) continue;

    if (section.getBoundingClientRect().top <= SCROLL_SPY_OFFSET) {
      currentId = id;
    }
  }

  return currentId;
}

const MOBILE_MEDIA_QUERY = "(max-width: 639px)";

function centerActiveLink(container: HTMLElement, link: HTMLElement) {
  const linkCenter = link.offsetLeft + link.offsetWidth / 2;
  const scrollLeft = linkCenter - container.clientWidth / 2;

  container.scrollTo({
    left: Math.max(0, scrollLeft),
    behavior: "smooth",
  });
}

const InnerNavigation = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [activeId, setActiveId] = useState<(typeof ADS_SECTION_NAV)[number]["id"]>(
    ADS_SECTION_NAV[0].id,
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

    const sections = ADS_SECTION_NAV.map(({ id }) => document.getElementById(id)).filter(
      (section): section is HTMLElement => section !== null,
    );

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
      ref={sectionRef}
      aria-label="Навигация по секции"
      className="sticky top-24 sm:top-28 z-30 -mt-14 w-full rounded-none border border-x-0 border-accent-foreground/15 bg-accent text-accent-foreground sm:mx-auto sm:w-fit sm:max-w-[calc(100%-2rem)] sm:rounded-full sm:border-x"
    >
      <div
        ref={scrollContainerRef}
        className="scrollbar-none flex gap-1 overflow-x-auto px-3 py-2 sm:px-4 sm:py-2.5"
      >
        {ADS_SECTION_NAV.map((item) => (
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
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium capitalize text-accent-foreground transition-colors",
              activeId === item.id
                ? "bg-primary text-primary-foreground"
                : "text-accent-foreground/90 hover:bg-accent-foreground/10 hover:text-accent-foreground",
            )}
          >
            {item.label}
          </a>
        ))}
        <Button asChild variant="default" size="sm" className="shrink-0 rounded-full uppercase">
          <a href="#buy-now" className="font-semibold">
            Купи сега
          </a>
        </Button>
      </div>
    </nav>
  );
};

export default InnerNavigation;
