"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { HeroBulletsRow } from "@/components/services/service-pas-landing/hero-bullets-row";

interface PasHeroBulletsSectionProps {
  bullets: readonly string[];
}

export function PasHeroBulletsSection({ bullets }: PasHeroBulletsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !listRef.current) return;

    const items = listRef.current.querySelectorAll<HTMLElement>("[data-hero-bullet]");
    if (!items.length) return;

    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, y: 28 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.09,
        delay: 0.25,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [bullets]);

  if (bullets.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative z-10 shrink-0 border-t border-border/50 bg-linear-to-b from-secondary/20 via-background to-background py-10 md:py-14"
      aria-label="Основни предимства"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/25 to-transparent"
        aria-hidden
      />
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <HeroBulletsRow ref={listRef} bullets={bullets} />
        </div>
      </div>
    </section>
  );
}
