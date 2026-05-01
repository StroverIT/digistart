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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 opacity-0 translate-y-10"
          >
            <MessageCircle className="h-4 w-4" />
            Безплатна консултация
          </div>

          <h2
            ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance opacity-0 translate-y-10"
          >
            Готови да изградите вашето <span className="gradient-text">онлайн присъствие?</span>
          </h2>

          <p
            ref={descRef}
            className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed opacity-0 translate-y-10"
          >
            Свържете се с нас за безплатна консултация. Ще обсъдим вашите нужди и ще ви предложим
            най-доброто решение за вашия бизнес.
          </p>

          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 translate-y-10"
          >
            <TrackedCtaLink href="/consultation" ctaId="bottom_free_consultation">
              <Button size="lg" className="glow-primary text-lg h-14 px-8">
                Запази безплатна консултация
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </TrackedCtaLink>
            <TrackedCtaLink href="/#services" ctaId="bottom_view_services">
              <Button variant="outline" size="lg" className="text-lg h-14 px-8">
                Разгледайте услугите
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
