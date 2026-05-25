"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { services } from "@/lib/data/services";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const stickerMap: Record<string, string> = {
  "ready-store": "/stickers/online-shop.png",
  "google-business": "/stickers/my-business.png",
  "social-media": "/stickers/social-media.png",
  ads: "/stickers/social-media.png",
};

function ServiceSticker({
  serviceId,
  alt,
  className,
  sizes,
}: {
  serviceId: string;
  alt: string;
  className?: string;
  sizes: string;
}) {
  const src = stickerMap[serviceId];
  if (!src) return null;

  return (
    <div className={cn("relative shrink-0", className)}>
      <Image src={src} alt={alt} fill className="object-contain" sizes={sizes} />
    </div>
  );
}

export function ServicesSection() {
  const containerRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      gsap.set([eyebrowRef.current, titleRef.current, descRef.current], {
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

      tl.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0)
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.55 }, "-=0.25")
        .to(descRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25");

      const sections = sectionRefs.current.filter(Boolean);
      if (sections.length) {
        gsap.set(sections, { opacity: 0, y: 50, scale: 0.95 });
        gsap.to(sections, {
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

  return (
    <section ref={containerRef} id="services" className="py-20 md:py-28 bg-card/50">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span
            ref={eyebrowRef}
            className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block opacity-0 translate-y-10"
          >
            Какво получаваш
          </span>
          <h2
            ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance opacity-0 translate-y-10"
          >
            Всичко нужно, за да превърнеш идеята си в{" "}
            <span className="gradient-text">работещ онлайн бизнес</span>
          </h2>
          <p
            ref={descRef}
            className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
          >
            Комбинираме онлайн магазин, Google Business и социални мрежи така, че клиентите да те
            намират, да ти вярват и да поръчват без писане на десетки съобщения.
          </p>
        </div>

        {/* Service tiles - explicit 1 col + minmax(0,1fr) on mobile; bleed past container px on small screens */}
        <div className="min-w-0 max-sm:-mx-4 sm:mx-auto ">
          <div className="px-4 grid grid-cols-1 sm:grid-cols-2  gap-6 lg:gap-8">
            {services.map((service, index) => (
              <div
                key={service.id}
                ref={(el) => {
                  sectionRefs.current[index] = el;
                }}
                className="opacity-0 translate-y-10 w-full min-w-0 [&>span]:flex [&>span]:w-full"
              >
                <TrackedCtaLink
                  href={`/services/${service.slug}`}
                  ctaId={`home_service_${service.slug}`}
                  className={cn(
                    "flex flex-col items-center justify-center gap-4 w-full",
                    "rounded-xl border border-border bg-card p-8 md:p-10",
                    "hover:border-primary/50 hover:bg-card/80 transition-all duration-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "cursor-pointer group no-underline text-inherit",
                  )}
                >
                  <ServiceSticker
                    serviceId={service.id}
                    alt={`${service.name} sticker`}
                    className="h-56 w-56 group-hover:scale-105 transition-transform"
                    sizes="(max-width: 640px) 14rem, 28rem"
                  />
                  <span className="text-lg sm:text-2xl font-bold text-center">{service.name}</span>
                </TrackedCtaLink>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
