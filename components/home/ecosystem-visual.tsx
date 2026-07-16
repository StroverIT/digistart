"use client";

import { useEffect, useRef } from "react";
import {
  MapPin,
  Megaphone,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";

type Planet = {
  icon: typeof ShoppingBag;
  label: string;
  /** Orbit radius as % of container half-size (0–100). */
  radius: number;
  /** Full revolution duration in seconds. */
  duration: number;
  /** Starting angle in degrees (0 = top). */
  angle: number;
};

const planets: Planet[] = [
  { icon: ShoppingBag, label: "Онлайн магазин", radius: 36, duration: 32, angle: 8 },
  { icon: Megaphone, label: "Реклами", radius: 36, duration: 32, angle: 128 },
  { icon: Store, label: "Физически магазини", radius: 36, duration: 32, angle: 248 },
  { icon: Truck, label: "Доставка", radius: 48, duration: 48, angle: 52 },
  { icon: MapPin, label: "Google Maps", radius: 48, duration: 48, angle: 142 },
  { icon: MessageCircle, label: "Социални мрежи", radius: 48, duration: 48, angle: 232 },
  { icon: Sparkles, label: "Съдържание", radius: 48, duration: 48, angle: 322 },
];

const ORBIT_RINGS = [36, 48] as const;

export function EcosystemVisual() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    let revert: (() => void) | undefined;

    void (async () => {
      const { default: gsap } = await import("gsap");
      if (cancelled || !rootRef.current) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const ctx = gsap.context(() => {
        const sun = root.querySelector<HTMLElement>("[data-eco-sun]");
        const sunCore = root.querySelector<HTMLElement>("[data-eco-sun-core]");
        const corona = root.querySelectorAll<HTMLElement>("[data-eco-corona]");
        const rings = root.querySelectorAll<HTMLElement>("[data-eco-ring]");
        const orbits = root.querySelectorAll<HTMLElement>("[data-eco-orbit]");
        const planetBodies = root.querySelectorAll<HTMLElement>("[data-eco-planet]");

        if (!sun || !sunCore) return;

        if (reducedMotion) {
          gsap.set([sun, corona, rings, planetBodies], { autoAlpha: 1, scale: 1 });
          return;
        }

        gsap.set(corona, { autoAlpha: 0, scale: 0.7 });
        gsap.set(rings, { autoAlpha: 0, scale: 0.9 });
        gsap.set(sun, { autoAlpha: 0, scale: 0.45 });
        gsap.set(planetBodies, { autoAlpha: 0, scale: 0.3 });

        const tl = gsap.timeline({ delay: 0.15, defaults: { ease: "power3.out" } });

        tl.to(corona, {
          autoAlpha: 1,
          scale: 1,
          duration: 1.15,
          stagger: 0.12,
        })
          .to(
            sun,
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.8,
              ease: "back.out(1.6)",
            },
            "-=0.85",
          )
          .to(
            rings,
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.75,
              stagger: 0.1,
            },
            "-=0.45",
          )
          .to(
            planetBodies,
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.5,
              stagger: { each: 0.07, from: "random" },
              ease: "back.out(1.4)",
            },
            "-=0.3",
          )
          .call(() => {
            gsap.to(sunCore, {
              scale: 1.06,
              duration: 2.4,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            });

            gsap.to(corona, {
              scale: 1.08,
              duration: 3.2,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              stagger: 0.35,
            });

            orbits.forEach((orbit) => {
              const duration = Number(orbit.dataset.duration) || 40;
              const face = orbit.querySelector<HTMLElement>("[data-eco-planet-face]");

              gsap.to(orbit, {
                rotation: "+=360",
                duration,
                repeat: -1,
                ease: "none",
                transformOrigin: "50% 50%",
              });

              if (face) {
                gsap.to(face, {
                  rotation: "-=360",
                  duration,
                  repeat: -1,
                  ease: "none",
                  transformOrigin: "50% 50%",
                });
              }
            });
          });
      }, root);

      revert = () => ctx.revert();
    })();

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return (
    <div ref={rootRef} className="relative mx-auto aspect-square w-full max-w-[480px]">
      {/* Soft ambient wash — wrappers keep centering free of GSAP transforms */}
      <div className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2">
        <div
          data-eco-corona
          className="h-full w-full rounded-full bg-primary/20 opacity-0 blur-3xl"
          aria-hidden
        />
      </div>
      <div className="absolute left-1/2 top-1/2 h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2">
        <div
          data-eco-corona
          className="h-full w-full rounded-full bg-chart-6/25 opacity-0 blur-2xl"
          aria-hidden
        />
      </div>

      {/* Orbital paths */}
      {ORBIT_RINGS.map((radius) => (
        <div
          key={radius}
          data-eco-ring
          className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-dashed border-accent/20 opacity-0"
          style={{
            width: `${radius * 2}%`,
            height: `${radius * 2}%`,
            marginLeft: `${-radius}%`,
            marginTop: `${-radius}%`,
          }}
          aria-hidden
        />
      ))}

      {/* Planets */}
      {planets.map(({ icon: Icon, label, radius, duration, angle }) => (
        <div
          key={label}
          data-eco-orbit
          data-duration={duration}
          className="absolute left-1/2 top-1/2"
          style={{
            width: `${radius * 2}%`,
            height: `${radius * 2}%`,
            marginLeft: `${-radius}%`,
            marginTop: `${-radius}%`,
            transform: `rotate(${angle}deg)`,
          }}
        >
          {/* Anchor at the 12 o'clock point of this orbit */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
            <div data-eco-planet className="opacity-0">
              <div
                data-eco-planet-face
                className="flex h-[4.5rem] w-[4.5rem] flex-col items-center justify-center rounded-full border border-border bg-card px-1.5 text-center shadow-[var(--shadow-soft)]"
                style={{ transform: `rotate(${-angle}deg)` }}
              >
                <Icon className="h-5 w-5 text-primary" strokeWidth={2.2} />
                <span className="mt-0.5 max-w-[3.75rem] text-[9px] font-semibold leading-tight text-foreground">
                  {label}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Sun */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <div
          data-eco-sun
          className="relative flex h-32 w-32 items-center justify-center opacity-0"
        >
          <div
            className="absolute inset-[-18%] rounded-full bg-primary/35 blur-xl"
            aria-hidden
          />
          <div
            className="absolute inset-[-6%] rounded-full bg-gradient-to-br from-primary/80 via-primary to-chart-6/70 blur-[2px]"
            aria-hidden
          />
          <div
            data-eco-sun-core
            className="relative flex h-full w-full flex-col items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
          >
            <span className="font-heading text-[11px] uppercase tracking-[0.18em] text-primary-foreground/80">
              DigiStart
            </span>
            <span className="mt-0.5 font-heading text-2xl font-bold leading-none">360°</span>
          </div>
        </div>
      </div>
    </div>
  );
}
