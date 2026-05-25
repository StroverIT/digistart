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
          "mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:mt-8 sm:gap-x-10",
          className,
        )}
        role="list"
      >
        {bullets.map((bullet) => (
          <li
            key={bullet}
            className="inline-flex max-w-[16rem] items-center gap-2 text-left text-sm text-muted-foreground sm:max-w-xs sm:text-base"
          >
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"
              aria-hidden
            >
              <Check className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="text-pretty leading-snug">{bullet}</span>
          </li>
        ))}
      </ul>
    );
  },
);
