"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SERVICE_DETAIL_HERO_PRIMARY_BUTTON_CLASSNAME } from "@/components/services/service-detail-primary-cta-styles";

interface PasHeroCtaSectionProps {
  priceSlot: ReactNode;
  primaryLabel: string;
  onPrimaryClick: () => void;
}

export function PasHeroCtaSection({
  priceSlot,
  primaryLabel,
  onPrimaryClick,
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
    <div
      ref={sectionRef}
      className="relative z-10 shrink-0 pb-10 md:pb-12"
    >
      <div className="container mx-auto px-4">
        <div
          ref={rowRef}
          className="mx-auto flex max-w-4xl translate-y-10 flex-col items-center justify-center gap-4 opacity-0"
        >
          <Button
            onClick={onPrimaryClick}
            size="lg"
            className="glow-primary text-lg h-14 px-8"
          >
            {primaryLabel}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
