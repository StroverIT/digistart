"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { toast } from "sonner";
import { subscriptionPlans, type PlanId, BUNDLE_PAGE_PATH } from "@/lib/data/plans";
import { addPlanToCart } from "@/lib/store/cart";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { PlanCard } from "@/components/plans/plan-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface PlansSectionProps {
  id?: string;
  className?: string;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export function PlansSection({
  id = "plans",
  className,
  title = "Абонаментни пакети",
  subtitle = "Избери готов пакет с месечно плащане или конфигурирай услугите поотделно по-долу.",
  compact = false,
}: PlansSectionProps) {
  const { push } = useTransitionRouter();
  const [addingPlanId, setAddingPlanId] = useState<PlanId | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      gsap.set([titleRef.current, subtitleRef.current, ctaRef.current], {
        opacity: 0,
        y: 40,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "back.out(1.6)" },
      });

      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.55 }, 0)
        .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25")
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25");

      const cards = cardRefs.current.filter(Boolean);
      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 50, scale: 0.95 });
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSelect = (planId: PlanId) => {
    setAddingPlanId(planId);
    const result = addPlanToCart(planId);
    setAddingPlanId(null);
    if (!result.added) {
      if (result.reason === "duplicate") {
        toast.info("Този план вече е в количката.");
        push("/cart");
      }
      return;
    }
    toast.success("Планът е добавен в количката.");
    push("/cart");
  };

  return (
    <section ref={containerRef} id={id} className={cn("py-16 md:py-24", className)}>
      <div className="container mx-auto max-w-6xl px-4">
        <div
          className={cn(
            "mx-auto flex flex-col items-center text-center",
            compact ? "mb-10 max-w-2xl" : "mb-12 max-w-2xl md:mb-14",
          )}
        >
          <h2
            ref={titleRef}
            className="text-balance text-3xl font-bold tracking-tight opacity-0 translate-y-10 md:text-4xl"
          >
            {title}
          </h2>
          <p
            ref={subtitleRef}
            className="mt-3 text-pretty text-muted-foreground opacity-0 translate-y-10 md:text-lg"
          >
            {subtitle}
          </p>
          <div ref={ctaRef} className="mt-5 opacity-0 translate-y-10">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-full border-primary/30 px-4" asChild>
              <Link href={BUNDLE_PAGE_PATH}>
                Пълно сравнение на пакетите
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
          {subscriptionPlans.map((plan, index) => (
            <div
              key={plan.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="opacity-0 translate-y-10"
            >
              <PlanCard
                plan={plan}
                onSelect={handleSelect}
                isAdding={addingPlanId === plan.id}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
