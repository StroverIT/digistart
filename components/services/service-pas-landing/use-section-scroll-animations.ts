"use client";

import { type RefObject, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type SectionScrollAnimationOptions = {
  staggerReveal?: number;
  staggerCard?: number;
  start?: string;
};

function completeIfAlreadyInView(tween: gsap.core.Tween) {
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    const progress = tween.scrollTrigger?.progress ?? 0;
    if (progress > 0) {
      tween.progress(1);
    }
  });
}

export function useSectionScrollAnimations(
  sectionRef: RefObject<HTMLElement | null>,
  options?: SectionScrollAnimationOptions,
  enabled = true,
  deps: unknown[] = [],
) {
  useEffect(() => {
    if (!enabled) return;

    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = options?.start ?? "top 80%";
    const staggerReveal = options?.staggerReveal ?? 0.1;
    const staggerCard = options?.staggerCard ?? 0.15;

    const ctx = gsap.context(() => {
      const reveals = section.querySelectorAll<HTMLElement>("[data-animate-reveal]");
      const cards = section.querySelectorAll<HTMLElement>("[data-animate-card]");

      if (reducedMotion) {
        gsap.set([...reveals, ...cards], { opacity: 1, y: 0, scale: 1 });
        return;
      }

      if (reveals.length) {
        gsap.set(reveals, { opacity: 0, y: 40 });
        const revealTween = gsap.to(reveals, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: staggerReveal,
          ease: "back.out(1.6)",
          scrollTrigger: {
            trigger: section,
            start,
            toggleActions: "play none none none",
          },
        });
        completeIfAlreadyInView(revealTween);
      }

      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 50, scale: 0.95 });
        const cardTween = gsap.to(cards, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: staggerCard,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: section,
            start,
            toggleActions: "play none none none",
          },
        });
        completeIfAlreadyInView(cardTween);
      }
    }, section);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sectionRef is stable; deps are caller-controlled
  }, [enabled, ...deps]);
}
