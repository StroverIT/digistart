"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";

const benefits = [
  "Безплатна консултация",
  "Гарантирани резултати",
  "Поддръжка 24/7",
];

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      const benefitEls = benefitsRef.current?.children
        ? Array.from(benefitsRef.current.children)
        : [];

      gsap.set(
        [titleRef.current, subRef.current, ...benefitEls, ctaRef.current, scrollRef.current],
        { opacity: 0, y: 40 },
      );

      const tl = gsap.timeline({ defaults: { ease: "back.out(1.6)" } });
      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.05)
        .to(subRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25")
        .to(benefitEls, { opacity: 1, y: 0, duration: 0.45, stagger: 0.08 }, "-=0.2")
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2")
        .to(scrollRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.15");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h1
            ref={titleRef}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl sm:leading-17 mb-6 text-balance opacity-0 translate-y-10"
          >
            Изградете <span className="gradient-text">дигиталното бъдеще</span> на вашия бизнес
          </h1>

          {/* Subheadline */}
          <p
            ref={subRef}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed text-pretty opacity-0 translate-y-10"
          >
            Професионални уеб сайтове, онлайн магазини и дигитален маркетинг. Превръщаме вашите идеи в
            работещи решения, които генерират приходи.
          </p>

          {/* Benefits */}
          <div ref={benefitsRef} className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-10">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-2 text-sm text-muted-foreground opacity-0 translate-y-10"
              >
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 translate-y-10">
            <TrackedCtaLink href="/#services" ctaId="hero_view_services">
              <Button size="lg" className="glow-primary text-lg h-14 px-8">
                Вижте услугите
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </TrackedCtaLink>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce max-sm:hidden opacity-0 translate-y-10"
      >
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
