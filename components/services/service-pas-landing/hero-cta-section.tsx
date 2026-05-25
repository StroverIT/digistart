"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import gsap from "gsap";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface PasHeroCtaSectionProps {
  primaryLabel: string;
  onPrimaryClick: () => void;
  socialProof?: string;
}

export function PasHeroCtaSection({
  primaryLabel,
  onPrimaryClick,
  socialProof,
}: PasHeroCtaSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !rowRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(rowRef.current, { opacity: 0, y: 40 });
      gsap.to(rowRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "back.out(1.6)",
        delay: 0.35,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="relative z-10 shrink-0 w-full">
      <div
        ref={rowRef}
        className="flex translate-y-10 flex-col items-center gap-3 opacity-0"
      >

        <Button
          onClick={onPrimaryClick}
          size="lg"
          className="glow-primary text-lg h-14 px-8"
        >
          {primaryLabel}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        {socialProof ? (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-green-500" aria-hidden />
            {socialProof}
          </p>
        ) : null}
      </div>
    </div>
  );
}
