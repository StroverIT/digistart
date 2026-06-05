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
const TRANSITION_LOGO_SRC = "/logo.png";
const BOLT_STRIKE_FILL = "#ffffff";
const BOLT_CHARGE_FILL = "#3b82f6";
const LOGO_GLOW = "drop-shadow(0px 0px 35px rgba(59, 130, 246, 1))";
const LIGHTNING_GLOW = LOGO_GLOW;
const STRIKE_GLOW =
  "brightness(1.5) drop-shadow(0px 0px 80px rgba(255, 255, 255, 1))";

const LIGHTNING_PATH =
  "M 100 20 L 96 42 L 107 52 L 90 77 L 100 92 C 95 110, 100 125, 97 160 L 130 215 L 85 245 L 112 285 L 90 325 L 120 375 L 80 325 L 102 285 L 70 245 L 118 215 L 85 160 C 85 135, 80 110, 88 92 L 78 77 L 95 52 L 85 42 Z";

function routeKey(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function resetLightning(
  lightningLeft: HTMLDivElement | null,
  lightningRight: HTMLDivElement | null,
  boltLeft: SVGPathElement | null,
  boltRight: SVGPathElement | null,
) {
  if (lightningLeft) {
    gsap.set(lightningLeft, { scale: 1, opacity: 0, filter: "none", x: 16, y: 0 });
  }
  if (lightningRight) {
    gsap.set(lightningRight, { scale: 1, opacity: 0, filter: "none", x: 16, y: 0 });
  }
  if (boltLeft) {
    gsap.set(boltLeft, { fill: BOLT_STRIKE_FILL });
  }
  if (boltRight) {
    gsap.set(boltRight, { fill: BOLT_STRIKE_FILL });
  }
}

function resetLogo(logo: HTMLImageElement | null) {
  if (!logo) return;
  gsap.set(logo, { scale: 0, rotation: 0, opacity: 0, filter: "none", y: 0 });
}

function PageTransitionProviderContent({
  children,
}: PageTransitionProviderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const lightningLeftRef = useRef<HTMLDivElement>(null);
  const lightningRightRef = useRef<HTMLDivElement>(null);
  const boltLeftPathRef = useRef<SVGPathElement>(null);
  const boltRightPathRef = useRef<SVGPathElement>(null);
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
    const lightningLeft = lightningLeftRef.current;
    const lightningRight = lightningRightRef.current;
    const boltLeft = boltLeftPathRef.current;
    const boltRight = boltRightPathRef.current;
    const logo = logoRef.current;

    gsap.killTweensOf([overlay, lightningLeft, lightningRight, boltLeft, boltRight, logo]);
    gsap.set(overlay, {
      yPercent: 100,
      visibility: "visible",
      backgroundColor: OVERLAY_BG,
    });

    resetLightning(lightningLeft, lightningRight, boltLeft, boltRight);
    resetLogo(logo);

    const tl = gsap.timeline({
      onComplete: () => {
        onComplete();

        // Logo slowly hovers up and down while waiting
        if (logo) {
          gsap.to(logo, {
            y: -8,
            duration: 1.5,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          });
        }
      },
    });

    // 1. Overcast (Overlay comes in)
    tl.to(overlay, {
      yPercent: 0,
      duration: 0.4,
      ease: "power3.inOut",
    });

    if (lightningLeft && lightningRight && boltLeft && boltRight && logo) {
      const lightnings = [lightningLeft, lightningRight];
      const bolts = [boltLeft, boltRight];

      // 2. Logo Initial Entrance
      tl.fromTo(
        logo,
        { scale: 1.4, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          filter: LOGO_GLOW,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.2"
      );

      // 3. Infinite Lightning Strike Timeline (1.2s delay between loops)
      const strikeTl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.2,
        delay: 0.3, // Starts just as the logo finishes entering
      });

      // Background flash
      strikeTl.to(
        overlay,
        {
          backgroundColor: "#0f172a",
          duration: 0.05,
          yoyo: true,
          repeat: 1,
        }
      )
        // Logo pulses brightly with the strike
        .to(logo, { filter: STRIKE_GLOW, scale: 1.05, duration: 0.05 }, "<")
        .to(logo, { filter: LOGO_GLOW, scale: 1, duration: 0.25, ease: "power2.out" }, "+=0.05")

        // Side lightnings flash simultaneously
        .fromTo(
          lightnings,
          { scale: 1.35, opacity: 0, filter: STRIKE_GLOW, x: 28, y: -8 },
          {
            scale: 1,
            opacity: 1,
            filter: STRIKE_GLOW,
            x: 16,
            y: 0,
            duration: 0.04,
            ease: "none",
          },
          0 // Sync strictly with the background flash
        )
        .to(lightnings, { opacity: 0.12, duration: 0.03 })
        .to(lightnings, { opacity: 1, filter: LIGHTNING_GLOW, duration: 0.03 }, "<0.01")
        .to(bolts, { fill: BOLT_CHARGE_FILL, duration: 0.03 }, "<")
        .to(lightnings, { opacity: 0.3, duration: 0.03 })
        .to(lightnings, {
          opacity: 0,
          scale: 1.2,
          x: 24,
          duration: 0.07,
          ease: "power2.in",
        })
        .set(bolts, { fill: BOLT_STRIKE_FILL }); // Reset bolt color for the next loop

    } else {
      tl.to({}, { duration: 0.4 });
    }
  }, []);

  const finishTransition = useCallback(() => {
    const overlay = overlayRef.current;
    const lightningLeft = lightningLeftRef.current;
    const lightningRight = lightningRightRef.current;
    const boltLeft = boltLeftPathRef.current;
    const boltRight = boltRightPathRef.current;
    const logo = logoRef.current;

    // This successfully intercepts and kills all infinite timelines automatically
    gsap.killTweensOf([overlay, lightningLeft, lightningRight, boltLeft, boltRight, logo]);

    if (overlay) {
      gsap.set(overlay, {
        yPercent: 100,
        visibility: "hidden",
        backgroundColor: OVERLAY_BG,
      });
    }

    resetLightning(lightningLeft, lightningRight, boltLeft, boltRight);
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
        <div className="relative flex items-center justify-center">
          <img
            ref={logoRef}
            src={TRANSITION_LOGO_SRC}
            alt=""
            width={120}
            height={120}
            className="relative z-10 w-[120px]"
            draggable={false}
          />

          {/* Left Lightning Wrapper (Mirrored) */}
          <div className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 scale-x-[-1]">
            <div ref={lightningLeftRef}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 200 400"
                className="h-[150px] w-[75px]"
                aria-hidden="true"
              >
                <path
                  ref={boltLeftPathRef}
                  d={LIGHTNING_PATH}
                  fill={BOLT_STRIKE_FILL}
                />
              </svg>
            </div>
          </div>

          {/* Right Lightning Wrapper */}
          <div className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2">
            <div ref={lightningRightRef}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 200 400"
                className="h-[150px] w-[75px]"
                aria-hidden="true"
              >
                <path
                  ref={boltRightPathRef}
                  d={LIGHTNING_PATH}
                  fill={BOLT_STRIKE_FILL}
                />
              </svg>
            </div>
          </div>
        </div>
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