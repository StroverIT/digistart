"use client";

import { useEffect, useRef } from "react";
import { Globe, ShoppingCart, MapPin, Share2, ArrowRight } from "lucide-react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { services } from "@/lib/data/services";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";

gsap.registerPlugin(ScrollTrigger);

const iconMap: Record<string, React.ReactNode> = {
  Globe: <Globe className="h-8 w-8" />,
  ShoppingCart: <ShoppingCart className="h-8 w-8" />,
  MapPin: <MapPin className="h-8 w-8" />,
  Share2: <Share2 className="h-8 w-8" />,
};

const stickerMap: Record<string, string> = {
  websites: "/stickers/website.png",
  "ready-store": "/stickers/online-shop.png",
  "google-business": "/stickers/my-business.png",
  "social-media": "/stickers/social-media.png",
};

export function ServicesSection() {
  const containerRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

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

      const cards = cardRefs.current.filter(Boolean);
      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 50, scale: 0.95 });
        gsap.to(cards, {
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
            Нашите услуги
          </span>
          <h2
            ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance opacity-0 translate-y-10"
          >
            Всичко необходимо за вашия <span className="gradient-text">онлайн успех</span>
          </h2>
          <p
            ref={descRef}
            className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
          >
            От професионални уеб сайтове до пълно управление на социални мрежи - предлагаме комплексни
            решения за дигиталното присъствие на вашия бизнес.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <div
              key={service.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
            >
              <Card className="group bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden h-full">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col h-full">
                    {/* Sticker */}
                    <div className="-mt-8 -mx-8 mb-1 flex justify-center sm:-mt-10 sm:-mx-10 md:-mt-12 md:-mx-12">
                      <div className="group-hover:scale-105 transition-transform relative h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-72 lg:w-72">
                        {stickerMap[service.id] ? (
                          <Image
                            src={stickerMap[service.id]}
                            alt={`${service.name} sticker`}
                            className="object-contain"
                            fill
                            sizes="(max-width: 640px) 12rem, (max-width: 768px) 14rem, (max-width: 1024px) 16rem, 18rem"
                          />
                        ) : (
                          iconMap[service.icon]
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-3">{service.name}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                      {service.shortDescription}
                    </p>

                    {/* Price & CTA */}
                    <div className="flex flex-col sm:flex-row items-center sm:justify-between pt-4 border-t border-border">
                      <div>
                        <span className="text-sm text-muted-foreground">от</span>
                        <div className="flex items-baseline gap-1">
                          <Price
                            value={service.basePrice}
                            className="text-xl sm:text-2xl text-primary"
                          />
                          {service.isMonthly && <span className="text-muted-foreground">/мес</span>}
                        </div>
                      </div>
                      <TrackedCtaLink
                        href={`/services/${service.slug}`}
                        ctaId={`home_service_${service.slug}`}
                      >
                        <Button
                          variant="ghost"
                          className="max-sm:mt-4 bg-primary text-primary-foreground hover:bg-primary/90 sm:bg-transparent sm:text-foreground sm:hover:bg-primary sm:hover:text-primary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                          Научете повече
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </TrackedCtaLink>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
