"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { READY_STORE_SECTION_NAV } from "./section-nav";

const BUY_SECTION_ID = "buy-section";
const STICKY_OFFSET_PX = 112;

const InnerNavigation = () => {
  const navRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState<string>(READY_STORE_SECTION_NAV[0].id);
  const [hideNav, setHideNav] = useState(false);

  useEffect(() => {
    const buySection = document.getElementById(BUY_SECTION_ID);
    if (!buySection) return;

    const updateBuySectionVisibility = () => {
      setHideNav(buySection.getBoundingClientRect().top <= STICKY_OFFSET_PX);
    };

    updateBuySectionVisibility();
    window.addEventListener("scroll", updateBuySectionVisibility, { passive: true });
    window.addEventListener("resize", updateBuySectionVisibility);

    return () => {
      window.removeEventListener("scroll", updateBuySectionVisibility);
      window.removeEventListener("resize", updateBuySectionVisibility);
    };
  }, []);

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

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.killTweensOf(nav);

    if (reducedMotion) {
      gsap.set(nav, {
        y: hideNav ? -12 : 0,
        autoAlpha: hideNav ? 0 : 1,
        pointerEvents: hideNav ? "none" : "auto",
      });
      return;
    }

    gsap.to(nav, {
      y: hideNav ? -12 : 0,
      autoAlpha: hideNav ? 0 : 1,
      duration: 0.3,
      ease: hideNav ? "power2.in" : "power2.out",
      pointerEvents: hideNav ? "none" : "auto",
    });

    return () => {
      gsap.killTweensOf(nav);
    };
  }, [hideNav]);

  return (
    <nav
      ref={navRef}
      aria-label="Навигация по секции"
      aria-hidden={hideNav}
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
