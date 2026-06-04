"use client";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { PageTransitionContext } from "./transition-context";
import { PageTransitionContextType } from "./types";

type PageTransitionProviderProps = {
  children: ReactNode;
};

let gsapModule: Promise<typeof import("gsap")> | null = null;
function loadGsap() {
  gsapModule ??= import("gsap");
  return gsapModule;
}

const PageTransitionProvider = ({
  children,
}: PageTransitionProviderProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prefersReducedMotion = useRef(false);
  const pendingNavigationRef = useRef(false);
  const pathname = usePathname();

  const playExit = useCallback(
    (onComplete: () => void) => {
      if (!overlayRef.current || prefersReducedMotion.current) {
        onComplete();
        return;
      }

      if (isTransitioning) {
        return;
      }

      setIsTransitioning(true);

      void loadGsap().then(({ gsap }) => {
        if (!overlayRef.current) {
          onComplete();
          return;
        }

        gsap.to(overlayRef.current, {
          xPercent: 0,
          duration: 0.6,
          ease: "power2.inOut",
          onComplete: () => {
            onComplete();
          },
        });
      });
    },
    [isTransitioning],
  );

  const playEnter = useCallback(() => {
    if (!overlayRef.current || prefersReducedMotion.current) {
      setIsTransitioning(false);
      return;
    }

    void loadGsap().then(({ gsap }) => {
      if (!overlayRef.current) {
        setIsTransitioning(false);
        return;
      }

      gsap.to(overlayRef.current, {
        xPercent: 100,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          if (overlayRef.current) {
            gsap.set(overlayRef.current, { xPercent: -100 });
          }
          setIsTransitioning(false);
        },
      });
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (pendingNavigationRef.current && pathname) {
      pendingNavigationRef.current = false;
      playEnter();
    }
  }, [pathname, playEnter]);

  const setPendingNavigation = (pending: boolean) => {
    pendingNavigationRef.current = pending;
  };

  const hasPendingNavigation = () => {
    return pendingNavigationRef.current;
  };

  const value: PageTransitionContextType = {
    playExit,
    playEnter,
    isTransitioning,
    setPendingNavigation,
    hasPendingNavigation,
  };

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9999] pointer-events-none bg-gray-900"
        style={{ transform: "translateX(-100%)" }}
        aria-hidden="true"
      />
    </PageTransitionContext.Provider>
  );
};

export default PageTransitionProvider;
