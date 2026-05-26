"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { siteContact } from "@/lib/site-contact";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const containerRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      gsap.set(
        [badgeRef.current, titleRef.current, descRef.current, ctaRef.current, footRef.current],
        { opacity: 0, y: 40 },
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "back.out(1.6)" },
      });

      tl.to(badgeRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0)
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.55 }, "-=0.25")
        .to(descRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25")
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.55 }, "-=0.2")
        .to(footRef.current, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, "-=0.2");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="contacts" className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-background to-primary/5" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <TrackedCtaLink href="/digital-roadmap" ctaId="bottom_digital_roadmap_badge">
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 opacity-0 translate-y-10 cursor-pointer hover:bg-primary/15 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Безплатна дигитална пътна карта
            </div>
          </TrackedCtaLink>

          <h2
            ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance opacity-0 translate-y-10"
          >
            Имаш идея, продукт или услуга, но още нямаш{" "}
            <span className="gradient-text">ясен онлайн старт?</span>
          </h2>

          <p
            ref={descRef}
            className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed opacity-0 translate-y-10"
          >
            Нека направим 20-минутен разговор. Дори да не работим заедно, ще си тръгнете с ясен план в
            3 стъпки как да изведете бизнеса си онлайн и къде губите пари в момента.
          </p>

          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 translate-y-10"
          >
            <TrackedCtaLink href="/digital-roadmap" ctaId="bottom_digital_roadmap">
              <Button size="lg" className="glow-primary text-lg h-14 px-8">
                Запази безплатна дигитална пътна карта
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </TrackedCtaLink>
            <TrackedCtaLink href="/#services" ctaId="bottom_view_services">
              <Button variant="outline" size="lg" className="text-lg h-14 px-8">
                Вижте решенията
              </Button>
            </TrackedCtaLink>
          </div>

          <p
            ref={footRef}
            className="text-sm text-muted-foreground mt-8 opacity-0 translate-y-10"
          >
            Или ни се обадете на{" "}
            <a href={siteContact.phoneHref} className="text-primary hover:underline">
              {siteContact.phoneLabel}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
