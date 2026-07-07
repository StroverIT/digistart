"use client";

import { type RefObject, useEffect } from "react";

export type CreativesAnimationOptions = {
  /** Skip horizontal slide/rotate on desktop cards (avoids overflow with wide illustrations). */
  disableHorizontalOffset?: boolean;
};

export function useCreativesAnimations(
  sectionRef: RefObject<HTMLElement | null>,
  options?: CreativesAnimationOptions,
) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let cancelled = false;
    let revert: (() => void) | undefined;

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled || !sectionRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isMobile = window.matchMedia("(max-width: 767px)").matches;

      const ctx = gsap.context(() => {
        const root = sectionRef.current;
        if (!root) return;

        const reveals = root.querySelectorAll<HTMLElement>("[data-animate-reveal]");
        const cards = root.querySelectorAll<HTMLElement>("[data-animate-card]");

        if (reducedMotion) {
          const images = root.querySelectorAll<HTMLElement>("[data-animate-card-image]");
          const copies = root.querySelectorAll<HTMLElement>("[data-animate-card-copy]");
          const inViewReveals = root.querySelectorAll<HTMLElement>("[data-animate-in-view]");
          gsap.set([...reveals, ...cards, ...copies, ...inViewReveals], {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            rotate: 0,
          });
          gsap.set(images, { scale: 1 });
          return;
        }

        if (reveals.length) {
          gsap.set(reveals, { opacity: 0, y: 40 });
          gsap.to(reveals, {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.12,
            ease: "back.out(1.6)",
            scrollTrigger: {
              trigger: root,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          });
        }

        const inViewReveals = root.querySelectorAll<HTMLElement>("[data-animate-in-view]");
        inViewReveals.forEach((element) => {
          gsap.set(element, { opacity: 0, y: 40 });
          gsap.to(element, {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "back.out(1.6)",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          });
        });

        cards.forEach((card, index) => {
          const image = card.querySelector<HTMLElement>("[data-animate-card-image]");
          const copy = card.querySelector<HTMLElement>("[data-animate-card-copy]");

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          });

          if (isMobile) {
            gsap.set(card, { opacity: 0, y: 32 });
            if (copy) gsap.set(copy, { opacity: 0 });

            tl.to(card, {
              opacity: 1,
              y: 0,
              duration: 0.55,
              ease: "power2.out",
              clearProps: "transform",
            });

            if (copy) {
              tl.to(
                copy,
                {
                  opacity: 1,
                  duration: 0.45,
                  ease: "power2.out",
                },
                0.2,
              );
            }

            return;
          }

          gsap.set(card, {
            opacity: 0,
            y: 64,
            ...(options?.disableHorizontalOffset
              ? {}
              : {
                  x: index % 2 === 0 ? -56 : 56,
                  rotate: index % 2 === 0 ? -1.5 : 1.5,
                }),
            scale: 0.92,
          });

          if (image) gsap.set(image, { scale: 1.14 });
          if (copy) gsap.set(copy, { opacity: 0, y: 24 });

          tl.to(
            card,
            {
              opacity: 1,
              y: 0,
              x: 0,
              scale: 1,
              rotate: 0,
              duration: 0.7,
              ease: "power3.out",
              clearProps: "transform",
            },
            0,
          );

          if (image) {
            tl.to(
              image,
              {
                scale: 1,
                duration: 0.85,
                ease: "power2.out",
                clearProps: "transform",
              },
              0.08,
            );
          }

          if (copy) {
            tl.to(
              copy,
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
                clearProps: "transform",
              },
              0.28,
            );
          }
        });
      }, sectionRef.current);

      revert = () => ctx.revert();
    })();

    return () => {
      cancelled = true;
      revert?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sectionRef is stable
  }, []);
}
