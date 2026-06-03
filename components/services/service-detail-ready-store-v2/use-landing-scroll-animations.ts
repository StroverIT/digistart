"use client";

import { type RefObject, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type LandingScrollAnimationOptions = {
  staggerReveal?: number;
  staggerCard?: number;
  start?: string;
  /** When set, cards animate when this element enters view (e.g. a grid below the heading). */
  cardTriggerRef?: RefObject<HTMLElement | null>;
  cardStart?: string;
  /** Each `[data-animate-card]` animates when that element scrolls into view. */
  cardsOnViewIndividually?: boolean;
};

export function useLandingScrollAnimations(
  sectionRef: RefObject<HTMLElement | null>,
  options?: LandingScrollAnimationOptions,
) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = options?.start ?? "top 80%";
    const staggerReveal = options?.staggerReveal ?? 0.12;
    const staggerCard = options?.staggerCard ?? 0.15;
    const cardStart = options?.cardStart ?? start;

    const ctx = gsap.context(() => {
      const cardTrigger = options?.cardTriggerRef?.current ?? section;
      const reveals = section.querySelectorAll<HTMLElement>("[data-animate-reveal]");
      const cards = section.querySelectorAll<HTMLElement>("[data-animate-card]");

      if (reducedMotion) {
        gsap.set([...reveals, ...cards], { opacity: 1, y: 0, scale: 1 });
        return;
      }

      if (reveals.length) {
        gsap.set(reveals, { opacity: 0, y: 40 });
        gsap.to(reveals, {
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
      }

      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 50, scale: 0.95 });

        if (options?.cardsOnViewIndividually) {
          cards.forEach((card) => {
            gsap.to(card, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              ease: "back.out(1.2)",
              scrollTrigger: {
                trigger: card,
                start: cardStart,
                toggleActions: "play none none none",
              },
            });
          });
        } else if (cardTrigger) {
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: staggerCard,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: cardTrigger,
              start: cardStart,
              toggleActions: "play none none none",
            },
          });
        }
      }
    }, section);

    return () => ctx.revert();
    // Mount-only: animations attach to DOM inside sectionRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sectionRef is stable
  }, []);
}
