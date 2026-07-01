"use client";

import { useRef } from "react";
import { Faq, type FaqItem } from "@/components/ui/faq";
import {
  ServiceSectionBuyCta,
  type ServiceSectionBuyCtaConfig,
} from "@/components/services/service-section-buy-cta";
import { PasSectionIntro } from "./section-intro";
import { useSectionScrollAnimations } from "./use-section-scroll-animations";
import { cn } from "@/lib/utils";

export interface PasFaqSectionProps {
  title: string;
  description: string;
  items: readonly FaqItem[];
  headingFontClass?: string;
  buyCta?: ServiceSectionBuyCtaConfig;
  className?: string;
}

export function PasFaqSection({
  title,
  description,
  items,
  headingFontClass,
  buyCta,
  className,
}: PasFaqSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionScrollAnimations(sectionRef, { staggerReveal: 0.08 });

  return (
    <section ref={sectionRef} id="faq" className={cn("bg-card/40 py-8 md:py-14", className)}>
      <div className="container mx-auto px-4">
        <PasSectionIntro
          title={title}
          description={description}
          headingFontClass={headingFontClass}
          titleClassName="mb-3"
        />
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card px-5 py-2 shadow-sm sm:px-8 sm:py-4">
          <Faq items={[...items]} staggerItems />
        </div>
        {buyCta ? (
          <div data-animate-reveal className="mt-8 opacity-0 translate-y-10 md:mt-10">
            <ServiceSectionBuyCta {...buyCta} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
