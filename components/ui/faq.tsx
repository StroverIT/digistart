"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export type FaqItem = {
  question: string;
  answer: string;
};

const FAQ_ITEM_REVEAL_CLASS = "opacity-0 translate-y-10";

type FaqProps = {
  items: FaqItem[];
  className?: string;
  itemClassName?: string;
  questionClassName?: string;
  answerClassName?: string;
  type?: "single" | "multiple";
  collapsible?: boolean;
  /** Stagger each question when the parent section scrolls into view. */
  staggerItems?: boolean;
};

export function Faq({
  items,
  className,
  itemClassName,
  questionClassName,
  answerClassName,
  type = "single",
  collapsible = true,
  staggerItems = false,
}: FaqProps) {
  if (!items.length) return null;

  return (
    <Accordion type={type} collapsible={collapsible} className={cn("w-full", className)}>
      {items.map((item, index) => (
        <AccordionItem
          key={`${item.question}-${index}`}
          value={`faq-${index}`}
          data-animate-reveal={staggerItems ? "" : undefined}
          className={cn(
            "border-border",
            staggerItems && FAQ_ITEM_REVEAL_CLASS,
            itemClassName,
          )}
        >
          <AccordionTrigger className={cn("text-base sm:text-lg hover:no-underline", questionClassName)}>
            {item.question}
          </AccordionTrigger>
          <AccordionContent className={cn("text-muted-foreground leading-relaxed whitespace-pre-line", answerClassName)}>
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

