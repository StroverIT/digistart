"use client";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { PageTransitionContext } from "./transition-context";
import { PageTransitionContextType } from "./types";

type PageTransitionProviderProps = {
  children: ReactNode;
};

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
      // Skip animation if reduced motion or no overlay
      if (!overlayRef.current || prefersReducedMotion.current) {
        onComplete();
        return;
      }

      // Prevent double navigation
      if (isTransitioning) {
        return;
      }

      setIsTransitioning(true);

      // Curtain wipe: slide overlay from left (-100%) to center (0%)
      gsap.to(overlayRef.current, {
        xPercent: 0,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          onComplete();
        },
      });
    },
    [isTransitioning]
  );

  const playEnter = useCallback(() => {
    // Skip animation if reduced motion or no overlay
    if (!overlayRef.current || prefersReducedMotion.current) {
      setIsTransitioning(false);
      return;
    }

    // Curtain wipe: slide overlay from center (0%) to right (100%)
    gsap.to(overlayRef.current, {
      xPercent: 100,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        // Reset to -100% without flashing (happens instantly after animation)
        if (overlayRef.current) {
          gsap.set(overlayRef.current, { xPercent: -100 });
        }
        setIsTransitioning(false);
      },
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

    // Initialize overlay position (off-screen left)
    if (overlayRef.current) {
      gsap.set(overlayRef.current, { xPercent: -100 });
    }

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Listen to pathname changes to trigger enter animation
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
        aria-hidden="true"
      />
    </PageTransitionContext.Provider>
  );
};

export default PageTransitionProvider;
