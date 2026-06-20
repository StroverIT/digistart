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

const nodes = [
  { icon: ShoppingBag, label: "Онлайн магазин", className: "top-0 left-1/2 -translate-x-1/2" },
  { icon: Megaphone, label: "Реклами", className: "top-[12%] right-[10%]" },
  { icon: Store, label: "Физически магазини", className: "top-[42%] right-0 -translate-y-1/2" },
  { icon: Truck, label: "Доставка", className: "bottom-[18%] right-[10%]" },
  { icon: MapPin, label: "Google Maps", className: "bottom-0 left-1/2 -translate-x-1/2" },
  { icon: MessageCircle, label: "Социални мрежи", className: "bottom-1/4 left-0" },
  { icon: Sparkles, label: "Съдържание", className: "top-1/4 left-0" },
];

const ORBIT_DURATION = 48;

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
        const orbit = root.querySelector<HTMLElement>("[data-eco-orbit]");
        const rings = root.querySelectorAll<HTMLElement>("[data-eco-ring]");
        const center = root.querySelector<HTMLElement>("[data-eco-center]");
        const nodeCards = root.querySelectorAll<HTMLElement>("[data-eco-node]");
        const glows = root.querySelectorAll<HTMLElement>("[data-eco-glow]");

        if (!orbit) return;

        if (reducedMotion) {
          gsap.set([rings, center, nodeCards, glows], { autoAlpha: 1, scale: 1 });
          return;
        }

        gsap.set(glows, { autoAlpha: 0, scale: 0.85 });
        gsap.set(rings, { autoAlpha: 0, scale: 0.88 });
        gsap.set(center, { autoAlpha: 0, scale: 0.55 });
        gsap.set(nodeCards, { autoAlpha: 0, scale: 0.35 });

        const tl = gsap.timeline({ delay: 0.2, defaults: { ease: "power3.out" } });

        tl.to(glows, {
          autoAlpha: 1,
          scale: 1,
          duration: 1.1,
          stagger: 0.15,
        })
          .to(
            center,
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.75,
              ease: "back.out(1.7)",
            },
            "-=0.75",
          )
          .to(
            rings,
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.85,
              stagger: 0.1,
            },
            "-=0.5",
          )
          .to(
            nodeCards,
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.55,
              stagger: { each: 0.08, from: "random" },
              ease: "back.out(1.35)",
            },
            "-=0.35",
          )
          .call(() => {
            gsap.to(orbit, {
              rotation: 360,
              duration: ORBIT_DURATION,
              repeat: -1,
              ease: "none",
              transformOrigin: "50% 50%",
            });

            nodeCards.forEach((node) => {
              gsap.to(node, {
                rotation: -360,
                duration: ORBIT_DURATION,
                repeat: -1,
                ease: "none",
                transformOrigin: "50% 50%",
              });
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
      <div data-eco-orbit className="absolute inset-0">
        <div
          data-eco-ring
          className="absolute inset-8 rounded-full border-2 border-dashed border-accent/20 opacity-0"
        />
        <div
          data-eco-ring
          className="absolute inset-16 rounded-full border-2 border-dashed border-accent/15 opacity-0"
        />

        {nodes.map(({ icon: Icon, label, className }) => (
          <div key={label} className={`absolute ${className}`}>
            <div
              data-eco-node
              className="flex h-20 w-20 -translate-y-1/2 flex-col items-center justify-center rounded-2xl border border-border bg-card p-2 text-center opacity-0 shadow-[var(--shadow-soft)]"
            >
              <Icon className="h-5 w-5 text-primary" strokeWidth={2.2} />
              <span className="mt-1 text-[10px] font-semibold leading-tight text-foreground">
                {label}
              </span>
            </div>
          </div>
        ))}

        <div
          data-eco-glow
          className="absolute -left-10 -top-10 -z-10 h-40 w-40 rounded-full bg-primary/25 opacity-0 blur-3xl"
        />
        <div
          data-eco-glow
          className="absolute -bottom-10 -right-10 -z-10 h-40 w-40 rounded-full bg-chart-6/30 opacity-0 blur-3xl"
        />
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <div
          data-eco-center
          className="flex h-28 w-28 flex-col items-center justify-center rounded-3xl bg-primary text-primary-foreground opacity-0 shadow-[var(--shadow-glow)]"
        >
          <span className="font-heading text-xs uppercase tracking-widest text-primary-foreground/80">
            DigiStart
          </span>
          <span className="mt-1 font-heading text-2xl font-bold">360°</span>
        </div>
      </div>
    </div>
  );
}
