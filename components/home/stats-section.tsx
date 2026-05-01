"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: "2+", label: "Успешни проекта" },
  { value: "8+", label: "Години опит" },
  { value: "100%", label: "Удовлетвореност" },
];

export function StatsSection() {
  const containerRef = useRef<HTMLElement>(null);
  const statRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      const items = statRefs.current.filter(Boolean);
      if (!items.length) return;

      gsap.set(items, { opacity: 0, y: 50, scale: 0.95 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.12,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-16 bg-primary/5 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              ref={(el) => {
                statRefs.current[index] = el;
              }}
              className="text-center opacity-0 translate-y-10"
            >
              <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">{stat.value}</div>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
