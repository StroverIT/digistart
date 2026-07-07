"use client";

import { useMemo, useRef } from "react";
import { Faq, type FaqItem } from "@/components/ui/faq";
import { useCompetitorPlatformSelection } from "@/components/services/funnel/use-competitor-platform-selection";
import {
  applyCompetitorPlatformPlaceholder,
  personalizeCompetitorCopy,
} from "@/lib/funnel/competitor-platform-personalization";
import { getCompetitorPlatformFaqItem } from "@/lib/funnel/competitor-platform-pas";
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
  funnelId?: string;
}

export function PasFaqSection({
  title,
  description,
  items,
  headingFontClass,
  buyCta,
  className,
  funnelId,
}: PasFaqSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { answer } = useCompetitorPlatformSelection(funnelId);
  const faqItems = useMemo(() => {
    const personalizedItems = items.map((item) => {
      if (!funnelId) return item;

      const answerText = answer
        ? personalizeCompetitorCopy(item.answer, answer)
        : applyCompetitorPlatformPlaceholder(item.answer, null);

      return { ...item, answer: answerText };
    });

    if (!funnelId || !answer) return personalizedItems;

    const platformFaq = getCompetitorPlatformFaqItem(answer);
    if (!platformFaq) return personalizedItems;

    const withoutDuplicate = personalizedItems.filter(
      (item) => item.question !== platformFaq.question,
    );

    return [platformFaq, ...withoutDuplicate];
  }, [answer, funnelId, items]);
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
          <Faq items={faqItems} staggerItems />
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
