"use client";

import Image from "next/image";
import gsap from "gsap";
import { ChevronDown } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { LandingSection } from "@/components/services/service-detail-ready-store-v2/shared";
import {
  LANDING_CARD_CLASS,
  LANDING_REVEAL_CLASS,
} from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useLandingScrollAnimations } from "@/components/services/service-detail-ready-store-v2/use-landing-scroll-animations";

const benefits = [
  {
    title: "Google Ads — улавя готово търсене",
    description:
      "Показваме реклами на хора, които вече търсят решение — по ключови думи, заявки и локация. Search, Shopping и YouTube носят бързи поръчки с високо намерение.",
    image: "/stickers/my-business.png",
  },
  {
    title: "Meta — генерира ново търсене",
    description:
      "Достигаме до хора по интереси и поведение, докато скролват Instagram и Facebook. Reels, Carousels и Stories създават интерес, когато още не са търсили активно.",
    image: "/stickers/social-media.png",
  },
  {
    title: "Комбинирана стратегия и отчети",
    description:
      "Избираме правилния канал за всяка цел — бърза поръчка от Google или изграждане на аудитория в Meta. Месечен отчет показва какво работи и къде отива бюджетът.",
    image: "/marketing/newsletter.webp",
  },
] as const;

type Benefit = (typeof benefits)[number];

function BenefitRow({
  benefit,
  isActive,
  onSelect,
  panelId,
}: {
  benefit: Benefit;
  isActive: boolean;
  onSelect: () => void;
  panelId: string;
}) {
  const descRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const arrowBobRef = useRef<gsap.core.Tween | null>(null);
  const hasMountedRef = useRef(false);

  useLayoutEffect(() => {
    const desc = descRef.current;
    const inner = contentRef.current;
    const arrow = arrowRef.current;
    if (!desc || !inner || !arrow) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    arrowBobRef.current?.kill();
    arrowBobRef.current = null;
    gsap.killTweensOf([desc, arrow]);

    const startArrowBob = () => {
      if (reducedMotion) return;
      arrowBobRef.current = gsap.to(arrow, {
        y: 5,
        duration: 0.55,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    };

    const stopArrowBob = () => {
      arrowBobRef.current?.kill();
      arrowBobRef.current = null;
    };

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (isActive) {
        gsap.set(desc, { height: "auto", opacity: 1 });
        gsap.set(arrow, { rotate: 180, y: 0 });
        startArrowBob();
      } else {
        gsap.set(desc, { height: 0, opacity: 0 });
        gsap.set(arrow, { rotate: 0, y: 0 });
      }
      return;
    }

    if (reducedMotion) {
      gsap.set(desc, { height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 });
      gsap.set(arrow, { rotate: isActive ? 180 : 0, y: 0 });
      return;
    }

    if (isActive) {
      gsap.set(desc, { height: 0, opacity: 0 });
      const targetHeight = inner.scrollHeight;

      gsap
        .timeline()
        .to(arrow, { rotate: 180, y: 0, duration: 0.3, ease: "power2.out" }, 0)
        .to(
          desc,
          {
            height: targetHeight,
            opacity: 1,
            duration: 0.38,
            ease: "power3.out",
            onComplete: () => {
              gsap.set(desc, { height: "auto" });
            },
          },
          0,
        )
        .eventCallback("onComplete", startArrowBob);
      return;
    }

    stopArrowBob();

    if (desc.offsetHeight === 0) {
      gsap.set(desc, { height: 0, opacity: 0 });
      gsap.set(arrow, { rotate: 0, y: 0 });
      return;
    }

    gsap.set(desc, { height: desc.offsetHeight });

    gsap
      .timeline()
      .to(arrow, { rotate: 0, y: 0, duration: 0.28, ease: "power2.in" }, 0)
      .to(desc, { height: 0, opacity: 0, duration: 0.3, ease: "power2.in" }, 0);
  }, [isActive]);

  return (
    <li data-animate-card className={`border-b border-white/20 last:border-b-0 ${LANDING_CARD_CLASS}`}>
      <button
        type="button"
        onClick={onSelect}
        aria-expanded={isActive}
        aria-controls={panelId}
        className="flex w-full items-start justify-between gap-4 px-0 py-5 text-left text-white sm:py-6"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold sm:text-3xl">{benefit.title}</span>
          <div ref={descRef} id={panelId} className="overflow-hidden" aria-hidden={!isActive}>
            <div ref={contentRef}>
              <p className="pt-2 text-sm leading-relaxed text-white sm:text-xl font-light">
                {benefit.description}
              </p>
              <div className="relative mt-4 aspect-[6/5] w-full lg:hidden">
                <Image
                  src={benefit.image}
                  alt={benefit.title}
                  fill
                  className="object-contain p-2"
                  sizes="100vw"
                />
              </div>
            </div>
          </div>
        </span>
        <ChevronDown ref={arrowRef} className="mt-1 size-5 shrink-0 text-white" aria-hidden />
      </button>
    </li>
  );
}

const Benefits = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = benefits[activeIndex];
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const hasImageMountedRef = useRef(false);

  useLandingScrollAnimations(sectionRef, { staggerReveal: 0.1, staggerCard: 0.12 });

  useLayoutEffect(() => {
    const wrap = imageWrapRef.current;
    if (!wrap) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!hasImageMountedRef.current) {
      hasImageMountedRef.current = true;
      gsap.set(wrap, { opacity: 1, scale: 1 });
      return;
    }

    if (reducedMotion) return;

    gsap.fromTo(
      wrap,
      { opacity: 0.5, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" },
    );
  }, [activeIndex]);

  return (
    <LandingSection
      ref={sectionRef}
      id="benefits"
      data-nav-theme="dark"
      className="border-white/20 bg-[#111111] text-white"
    >
      <h2
        data-animate-reveal
        className={`mx-auto max-w-4xl text-center text-3xl font-medium text-white ${LANDING_REVEAL_CLASS}`}
      >
        Google за търсене. Meta за откриване. Една система вместо два хаотични акаунта.
      </h2>

      <article className="mt-12 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <ul className="flex flex-col">
          {benefits.map((benefit, index) => (
            <BenefitRow
              key={benefit.title}
              benefit={benefit}
              isActive={index === activeIndex}
              onSelect={() => setActiveIndex(index)}
              panelId={`ads-benefit-panel-${index}`}
            />
          ))}
        </ul>

        <div
          ref={imageWrapRef}
          data-animate-card
          className={`relative mx-auto hidden aspect-[6/5] w-full lg:block ${LANDING_CARD_CLASS}`}
        >
          <Image
            src={active.image}
            alt={active.title}
            fill
            className="object-contain p-4"
            sizes="(max-width: 1024px) 100vw, 50vw"
            loading="lazy"
          />
        </div>
      </article>
    </LandingSection>
  );
};

export default Benefits;
