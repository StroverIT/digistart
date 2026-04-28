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

type FaqProps = {
  items: FaqItem[];
  className?: string;
  itemClassName?: string;
  questionClassName?: string;
  answerClassName?: string;
  type?: "single" | "multiple";
  collapsible?: boolean;
};

export function Faq({
  items,
  className,
  itemClassName,
  questionClassName,
  answerClassName,
  type = "single",
  collapsible = true,
}: FaqProps) {
  if (!items.length) return null;

  return (
    <Accordion type={type} collapsible={collapsible} className={cn("w-full", className)}>
      {items.map((item, index) => (
        <AccordionItem
          key={`${item.question}-${index}`}
          value={`faq-${index}`}
          className={cn("border-border", itemClassName)}
        >
          <AccordionTrigger className={cn("text-base sm:text-lg hover:no-underline", questionClassName)}>
            {item.question}
          </AccordionTrigger>
          <AccordionContent className={cn("text-muted-foreground leading-relaxed", answerClassName)}>
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

