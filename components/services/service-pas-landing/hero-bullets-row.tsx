"use client";

import { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroBulletsRowProps {
  bullets: readonly string[];
  className?: string;
}

export const HeroBulletsRow = forwardRef<HTMLUListElement, HeroBulletsRowProps>(
  function HeroBulletsRow({ bullets, className }, ref) {
    if (bullets.length === 0) return null;

    return (
      <ul
        ref={ref}
        className={cn(
          "grid gap-3 sm:grid-cols-2 sm:gap-4",
          className,
        )}
        role="list"
      >
        {bullets.map((bullet) => (
          <li
            key={bullet}
            data-hero-bullet
            className="group flex items-start gap-3 rounded-xl border border-border/80 bg-card/70 px-4 py-3.5 shadow-sm backdrop-blur-sm transition-colors hover:border-primary/35 hover:bg-card/90"
          >
            <span
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary/20"
              aria-hidden
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            <span className="text-pretty text-sm leading-relaxed text-foreground sm:text-[0.9375rem]">
              {bullet}
            </span>
          </li>
        ))}
      </ul>
    );
  },
);
