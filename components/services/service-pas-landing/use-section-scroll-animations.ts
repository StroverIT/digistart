"use client";

import { type RefObject, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type SectionScrollAnimationOptions = {
  staggerReveal?: number;
  staggerCard?: number;
  staggerStep?: number;
  start?: string;
  /** ScrollTrigger start for individually animated cards/steps. */
  itemStart?: string;
  /** Play reveal/card/step animations immediately on mount (for above-the-fold sections). */
  animateOnMount?: boolean;
  /** Skip card stagger (when a dedicated card animation hook handles them). */
  skipCards?: boolean;
  /** Each `[data-animate-card]` animates when that element enters the viewport. */
  cardsOnViewIndividually?: boolean;
  /** Each `[data-animate-step]` animates when that element enters the viewport. */
  stepsOnViewIndividually?: boolean;
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

function animateElements(
  elements: HTMLElement[],
  vars: gsap.TweenVars,
  section: HTMLElement,
  start: string,
  animateOnMount: boolean,
) {
  if (!elements.length) return;

  if (animateOnMount) {
    gsap.to(elements, vars);
    return;
  }

  const tween = gsap.to(elements, {
    ...vars,
    scrollTrigger: {
      trigger: section,
      start,
      toggleActions: "play none none none",
    },
  });
  completeIfAlreadyInView(tween);
}

function animateElementsOnView(
  elements: HTMLElement[],
  vars: gsap.TweenVars,
  start: string,
) {
  elements.forEach((element) => {
    const tween = gsap.to(element, {
      ...vars,
      scrollTrigger: {
        trigger: element,
        start,
        toggleActions: "play none none none",
      },
    });
    completeIfAlreadyInView(tween);
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
    const itemStart = options?.itemStart ?? "top 88%";
    const staggerReveal = options?.staggerReveal ?? 0.1;
    const staggerCard = options?.staggerCard ?? 0.15;
    const staggerStep = options?.staggerStep ?? 0.12;
    const animateOnMount = options?.animateOnMount ?? false;
    const skipCards = options?.skipCards ?? false;
    const cardsOnViewIndividually = options?.cardsOnViewIndividually ?? false;
    const stepsOnViewIndividually = options?.stepsOnViewIndividually ?? false;

    const ctx = gsap.context(() => {
      const reveals = section.querySelectorAll<HTMLElement>("[data-animate-reveal]");
      const cards = section.querySelectorAll<HTMLElement>("[data-animate-card]");
      const steps = section.querySelectorAll<HTMLElement>("[data-animate-step]");

      if (reducedMotion) {
        gsap.set([...reveals, ...cards, ...steps], { opacity: 1, y: 0, scale: 1 });
        return;
      }

      if (reveals.length) {
        gsap.set(reveals, { opacity: 0, y: 40 });
        animateElements(
          [...reveals],
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: staggerReveal,
            ease: "back.out(1.6)",
            delay: animateOnMount ? 0.15 : 0,
          },
          section,
          start,
          animateOnMount,
        );
      }

      if (cards.length && !skipCards) {
        gsap.set(cards, { opacity: 0, y: 50, scale: 0.95 });

        if (cardsOnViewIndividually) {
          animateElementsOnView([...cards], {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.2)",
          }, itemStart);
        } else {
          animateElements(
            [...cards],
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              stagger: staggerCard,
              ease: "back.out(1.2)",
              delay: animateOnMount ? 0.2 : 0,
            },
            section,
            start,
            animateOnMount,
          );
        }
      }

      if (steps.length) {
        gsap.set(steps, { opacity: 0, y: 36 });

        if (stepsOnViewIndividually) {
          animateElementsOnView([...steps], {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power3.out",
          }, itemStart);
        } else {
          animateElements(
            [...steps],
            {
              opacity: 1,
              y: 0,
              duration: 0.55,
              stagger: staggerStep,
              ease: "power3.out",
            },
            section,
            start,
            animateOnMount,
          );
        }
      }
    }, section);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sectionRef is stable; deps are caller-controlled
  }, [enabled, ...deps]);
}
