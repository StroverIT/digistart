"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SCROLL_SPY_OFFSET = 160;

export type ServiceSectionNavItem = {
  readonly id: string;
  readonly label: string;
};

type ServiceInnerNavigationProps = {
  items: readonly ServiceSectionNavItem[];
  ariaLabel: string;
  ctaHref?: string;
  ctaLabel?: string;
  capitalizeLinks?: boolean;
};

function getActiveSectionId(items: readonly ServiceSectionNavItem[]): string {
  let currentId = items[0]?.id ?? "";

  for (const { id } of items) {
    const section = document.getElementById(id);
    if (!section) continue;

    if (section.getBoundingClientRect().top <= SCROLL_SPY_OFFSET) {
      currentId = id;
    }
  }

  return currentId;
}

function centerActiveLink(container: HTMLElement, link: HTMLElement) {
  const linkCenter = link.offsetLeft + link.offsetWidth / 2;
  const scrollLeft = linkCenter - container.clientWidth / 2;

  container.scrollTo({
    left: Math.max(0, scrollLeft),
    behavior: "smooth",
  });
}

export function ServiceInnerNavigation({
  items,
  ariaLabel,
  ctaHref = "#booking",
  ctaLabel = "Запази час",
  capitalizeLinks = false,
}: ServiceInnerNavigationProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  useEffect(() => {
    const container = scrollContainerRef.current;
    const activeLink = linkRefs.current.get(activeId);
    if (!container || !activeLink) return;

    centerActiveLink(container, activeLink);
  }, [activeId]);

  useEffect(() => {
    const syncActiveSection = () => {
      setActiveId((previous) => {
        const next = getActiveSectionId(items);
        return previous === next ? previous : next;
      });
    };

    syncActiveSection();

    const sections = items
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

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
  }, [items]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!mobileMenuRef.current?.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isMobileMenuOpen]);

  const linkClassName = cn(
    "text-sm font-medium text-accent-foreground transition-colors",
    capitalizeLinks && "capitalize",
  );

  const handleNavClick = (id: string) => {
    setActiveId(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      ref={sectionRef}
      aria-label={ariaLabel}
      className="sticky top-16 sm:top-20 z-30 -mt-14 w-full max-w-full sm:mx-auto sm:w-fit sm:max-w-[calc(100%-2rem)]"
    >
      <div ref={mobileMenuRef} className="flex justify-center px-4 sm:hidden">
        <div
          className={cn(
            "border border-accent-foreground/15 bg-accent text-accent-foreground shadow-lg",
            isMobileMenuOpen
              ? "w-full max-w-xs rounded-2xl px-4 py-3"
              : "w-fit rounded-full px-5 py-2.5",
          )}
        >
          <button
            type="button"
            aria-expanded={isMobileMenuOpen}
            aria-controls="service-inner-navigation-mobile-menu"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className={cn(
              "flex w-full items-center justify-center gap-2 text-sm font-medium",
              capitalizeLinks && "capitalize",
            )}
          >
            <span>{activeItem?.label}</span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 transition-transform duration-200",
                isMobileMenuOpen && "rotate-180",
              )}
              aria-hidden
            />
          </button>

          {isMobileMenuOpen ? (
            <div
              id="service-inner-navigation-mobile-menu"
              className="mt-2 flex flex-col items-center gap-1 border-t border-accent-foreground/10 pt-2"
            >
              {items.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={activeId === item.id ? "true" : undefined}
                  className={cn(
                    linkClassName,
                    "w-full rounded-lg px-3 py-2 text-center",
                    activeId === item.id
                      ? "text-accent-foreground"
                      : "text-accent-foreground/80 hover:text-accent-foreground",
                  )}
                >
                  {item.label}
                </a>
              ))}
              <Button asChild variant="default" size="sm" className="mt-2 w-full rounded-full uppercase">
                <a href={ctaHref} className="font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
                  {ctaLabel}
                </a>
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "hidden overflow-hidden rounded-none border border-x-0 border-accent-foreground/15 bg-accent text-accent-foreground sm:block sm:rounded-full sm:border-x",
        )}
      >
        <div
          ref={scrollContainerRef}
          className="scrollbar-none flex w-full min-w-0 touch-pan-x gap-1 overflow-x-auto overscroll-x-contain px-3 py-2 sm:px-4 sm:py-2.5"
        >
          {items.map((item) => (
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
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium text-accent-foreground transition-colors",
                capitalizeLinks && "capitalize",
                activeId === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-accent-foreground/90 hover:bg-accent-foreground/10 hover:text-accent-foreground",
              )}
            >
              {item.label}
            </a>
          ))}
          <Button asChild variant="default" size="sm" className="shrink-0 rounded-full uppercase">
            <a href={ctaHref} className="font-semibold">
              {ctaLabel}
            </a>
          </Button>
        </div>
      </div>
    </nav>
  );
}
