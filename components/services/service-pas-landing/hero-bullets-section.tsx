"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface PasHeroBulletsSectionProps {
  bullets: readonly string[];
  headingFontClass?: string;
}

export function PasHeroBulletsSection({ bullets, headingFontClass }: PasHeroBulletsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !listRef.current) return;

    const items = listRef.current.querySelectorAll<HTMLLIElement>("li");
    if (!items.length) return;

    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, y: 24 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.15,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [bullets]);

  if (bullets.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="border-b border-border/60 bg-card/20 pb-8 md:pb-10"
      aria-label="Основни предимства"
    >
      <div className="container mx-auto px-4">
        <ul
          ref={listRef}
          className={cn(
            "mx-auto grid max-w-4xl gap-3 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-3.5",
            headingFontClass,
          )}
          role="list"
        >
          {bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex items-start gap-3 text-base leading-relaxed text-foreground sm:text-lg opacity-0"
            >
              <span
                className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"
                aria-hidden
              >
                <Check className="h-3 w-3" strokeWidth={2.5} />
              </span>
              <span className="text-pretty">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
