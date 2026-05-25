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

    const ctx = gsap.context(() => {
      gsap.set(listRef.current, { opacity: 0, y: 32 });
      gsap.to(listRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.2,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [bullets]);

  if (bullets.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative z-10 shrink-0 bg-background/80 py-2 md:py-4"
      aria-label="Основни предимства"
    >
      <div className="container mx-auto px-4">
        <HeroBulletsRow
          ref={listRef}
          bullets={bullets}
          className="mt-0 translate-y-10 opacity-0 sm:mt-0"
        />
      </div>
    </section>
  );
}
