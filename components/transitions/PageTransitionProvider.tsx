"use client";
import React, {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  ReactNode,
  Suspense,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { PageTransitionContext } from "./transition-context";
import { PageTransitionContextType } from "./types";

type PageTransitionProviderProps = {
  children: ReactNode;
};

const OVERLAY_BG = "#050505";
const LOGO_GLOW = "drop-shadow(0px 0px 35px rgba(59, 130, 246, 1))";

function routeKey(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function resetLogo(logo: HTMLImageElement | null) {
  if (!logo) return;
  gsap.set(logo, {
    scale: 0,
    rotation: -45,
    opacity: 0,
    filter: "none",
    y: 0,
  });
}

function PageTransitionProviderContent({
  children,
}: PageTransitionProviderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const isAnimatingRef = useRef(false);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const prefersReducedMotion = useRef(false);
  const pendingNavigationRef = useRef(false);
  const routeSnapshotRef = useRef<string | null>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    gsap.set(overlay, { yPercent: 100, visibility: "hidden" });
  }, []);

  const playExit = useCallback((onComplete: () => void) => {
    if (!overlayRef.current || prefersReducedMotion.current) {
      onComplete();
      return;
    }

    if (isAnimatingRef.current) {
      return;
    }

    isAnimatingRef.current = true;
    setIsTransitioning(true);

    const overlay = overlayRef.current;
    const logo = logoRef.current;

    gsap.killTweensOf([overlay, logo]);
    gsap.set(overlay, { yPercent: 100, visibility: "visible" });
    resetLogo(logo);

    const tl = gsap.timeline({
      onComplete: () => {
        onComplete();

        if (logo) {
          gsap.to(logo, {
            y: -8,
            duration: 1.2,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          });
        }
      },
    });

    tl.to(overlay, {
      yPercent: 0,
      duration: 0.5,
      ease: "power3.inOut",
    });

    if (logo) {
      tl.fromTo(
        logo,
        { scale: 0, rotation: -45, opacity: 0 },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(1.7)",
        },
        "-=0.15",
      ).to(logo, {
        filter: LOGO_GLOW,
        scale: 1.12,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      });
    } else {
      tl.to({}, { duration: 0.4 });
    }
  }, []);

  const finishTransition = useCallback(() => {
    const overlay = overlayRef.current;
    const logo = logoRef.current;

    gsap.killTweensOf([overlay, logo]);

    if (overlay) {
      gsap.set(overlay, { yPercent: 100, visibility: "hidden" });
    }

    resetLogo(logo);
    isAnimatingRef.current = false;
    setIsTransitioning(false);
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
    if (!pendingNavigationRef.current || routeSnapshotRef.current === null) {
      return;
    }

    const currentRoute = routeKey(pathname, searchParams);
    if (currentRoute !== routeSnapshotRef.current) {
      pendingNavigationRef.current = false;
      routeSnapshotRef.current = null;
      finishTransition();
    }
  }, [pathname, searchParams, finishTransition]);

  const setPendingNavigation = useCallback(
    (pending: boolean) => {
      pendingNavigationRef.current = pending;
      if (pending) {
        routeSnapshotRef.current = routeKey(pathname, searchParams);
      } else {
        routeSnapshotRef.current = null;
      }
    },
    [pathname, searchParams],
  );

  const hasPendingNavigation = () => {
    return pendingNavigationRef.current;
  };

  const value: PageTransitionContextType = {
    playExit,
    playEnter: finishTransition,
    isTransitioning,
    setPendingNavigation,
    hasPendingNavigation,
  };

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center"
        style={{ backgroundColor: OVERLAY_BG }}
        aria-hidden="true"
      >
        <img
          ref={logoRef}
          src="/logo.png"
          alt=""
          width={120}
          height={120}
          className="w-[120px]"
          draggable={false}
        />
      </div>
    </PageTransitionContext.Provider>
  );
}

const PageTransitionProvider = ({ children }: PageTransitionProviderProps) => (
  <Suspense fallback={children}>
    <PageTransitionProviderContent>{children}</PageTransitionProviderContent>
  </Suspense>
);

export default PageTransitionProvider;
