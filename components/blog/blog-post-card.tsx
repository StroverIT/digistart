"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import type { BlogPost } from "@/config/blog";
import TransitionLink from "@/components/transitions/TransitionLink";

type BlogPostCardProps = {
  post: BlogPost;
};

export function BlogPostCard({ post }: BlogPostCardProps) {
  const rootRef = useRef<HTMLAnchorElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const arrowOutRef = useRef<SVGSVGElement>(null);
  const arrowInRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.set(sheenRef.current, { xPercent: -130, opacity: 0 });
      gsap.set(ringRef.current, { scale: 0.55, opacity: 0 });
      gsap.set(arrowInRef.current, { x: -20, opacity: 0, rotate: -25 });
      gsap.set(arrowOutRef.current, { x: 0, opacity: 1, rotate: 0 });

      const hoverTl = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
      });

      hoverTl
        .to(root, { y: -10, duration: 0.45 }, 0)
        .to(
          imageRef.current,
          { scale: 1.14, duration: 0.75, ease: "power2.out" },
          0,
        )
        .to(overlayRef.current, { opacity: 1, duration: 0.4 }, 0)
        .to(
          articleRef.current,
          {
            boxShadow:
              "0 22px 40px -18px color-mix(in oklch, var(--primary) 30%, transparent)",
            duration: 0.45,
          },
          0,
        )
        .to(titleRef.current, { color: "var(--primary)", duration: 0.35 }, 0)
        .to(
          buttonRef.current,
          {
            scale: 1.14,
            rotation: -8,
            duration: 0.45,
            ease: "back.out(2.4)",
          },
          0,
        )
        .to(
          arrowOutRef.current,
          {
            x: 22,
            opacity: 0,
            rotate: 25,
            duration: 0.28,
            ease: "power2.in",
          },
          0.04,
        )
        .to(
          arrowInRef.current,
          {
            x: 0,
            opacity: 1,
            rotate: 0,
            duration: 0.42,
            ease: "back.out(2.6)",
          },
          0.16,
        );

      const playSheen = () => {
        gsap.fromTo(
          sheenRef.current,
          { xPercent: -130, opacity: 0 },
          {
            xPercent: 130,
            opacity: 0.6,
            duration: 0.8,
            ease: "power2.inOut",
            overwrite: true,
          },
        );
      };

      const playRing = () => {
        gsap.fromTo(
          ringRef.current,
          { scale: 0.55, opacity: 0.55 },
          {
            scale: 1.9,
            opacity: 0,
            duration: 0.7,
            ease: "power2.out",
            overwrite: true,
          },
        );
      };

      const quickToX = gsap.quickTo(imageRef.current, "x", {
        duration: 0.55,
        ease: "power3.out",
      });
      const quickToY = gsap.quickTo(imageRef.current, "y", {
        duration: 0.55,
        ease: "power3.out",
      });
      const quickBtnX = gsap.quickTo(buttonRef.current, "x", {
        duration: 0.35,
        ease: "power3.out",
      });
      const quickBtnY = gsap.quickTo(buttonRef.current, "y", {
        duration: 0.35,
        ease: "power3.out",
      });

      const onEnter = () => {
        hoverTl.timeScale(1).play();
        playSheen();
        playRing();
      };

      const onLeave = () => {
        hoverTl.timeScale(1.4).reverse();
        gsap.set(sheenRef.current, { xPercent: -130, opacity: 0 });
        quickToX(0);
        quickToY(0);
        quickBtnX(0);
        quickBtnY(0);
      };

      const onMove = (event: PointerEvent) => {
        const imageWrap = imageWrapRef.current;
        const button = buttonRef.current;
        if (!imageWrap || !button) return;

        const imageBounds = imageWrap.getBoundingClientRect();
        const nx =
          (event.clientX - imageBounds.left) / imageBounds.width - 0.5;
        const ny =
          (event.clientY - imageBounds.top) / imageBounds.height - 0.5;
        quickToX(nx * 16);
        quickToY(ny * 12);

        const btnBounds = button.getBoundingClientRect();
        const bx = event.clientX - (btnBounds.left + btnBounds.width / 2);
        const by = event.clientY - (btnBounds.top + btnBounds.height / 2);
        const dist = Math.hypot(bx, by);
        const pull = Math.max(0, 1 - dist / 150);
        quickBtnX(bx * 0.14 * pull);
        quickBtnY(by * 0.14 * pull);
      };

      root.addEventListener("pointerenter", onEnter);
      root.addEventListener("pointerleave", onLeave);
      root.addEventListener("pointermove", onMove);

      return () => {
        root.removeEventListener("pointerenter", onEnter);
        root.removeEventListener("pointerleave", onLeave);
        root.removeEventListener("pointermove", onMove);
      };
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <TransitionLink
      ref={rootRef}
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-4 outline-none will-change-transform"
    >
      <div
        ref={imageWrapRef}
        className="relative aspect-669/483 overflow-hidden rounded-2xl bg-muted"
      >
        <Image
          ref={imageRef}
          src={post.coverImage.src}
          alt={post.coverImage.alt || post.title}
          width={post.coverImage.width}
          height={post.coverImage.height}
          className="h-full w-full object-cover will-change-transform"
          sizes="(max-width: 1024px) 100vw, 669px"
        />
        <div
          ref={overlayRef}
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/30 via-black/0 to-black/0 opacity-0"
        />
        <div
          ref={sheenRef}
          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 skew-x-[-18deg] bg-linear-to-r from-transparent via-white/40 to-transparent"
        />
      </div>

      <article
        ref={articleRef}
        className="relative flex flex-1 flex-col gap-3 overflow-hidden rounded-2xl bg-card px-5 py-6 shadow-sm ring-1 ring-border/60 md:px-6 md:py-7"
      >
        <h2
          ref={titleRef}
          className="font-heading text-xl font-bold leading-snug tracking-tight text-foreground md:text-2xl"
        >
          {post.title}
        </h2>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground md:text-base">
          {post.excerpt}
        </p>
        <span
          ref={buttonRef}
          className="relative mt-2 inline-flex size-10 items-center justify-center self-end overflow-hidden rounded-full bg-foreground text-background will-change-transform"
        >
          <span
            ref={ringRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-foreground/45"
          />
          <ArrowRight ref={arrowOutRef} className="size-4" strokeWidth={2.4} />
          <ArrowRight
            ref={arrowInRef}
            className="absolute size-4"
            strokeWidth={2.4}
          />
          <span className="sr-only">Прочети статията</span>
        </span>
      </article>
    </TransitionLink>
  );
}
