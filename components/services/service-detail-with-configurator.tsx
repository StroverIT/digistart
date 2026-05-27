"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  ArrowLeft,
  Check,
  Clock,
  MapPin,
  Share2,
  Sparkles,
  ShoppingCart,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { PricingConfigurator } from "@/components/services/pricing-configurator";
import { services } from "@/lib/data/services";
import type { Service } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger);

const iconMap: Record<string, ReactNode> = {
  ShoppingCart: <ShoppingCart className="h-12 w-12" />,
  MapPin: <MapPin className="h-12 w-12" />,
  Share2: <Share2 className="h-12 w-12" />,
  Sparkles: <Sparkles className="h-12 w-12" />,
};

interface ServiceDetailWithConfiguratorProps {
  service: Service;
}

export function ServiceDetailWithConfigurator({
  service,
}: ServiceDetailWithConfiguratorProps) {
  const pageRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = pageRootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const mountEls = root.querySelectorAll<HTMLElement>("[data-animate-mount]");
      if (mountEls.length) {
        gsap.set(mountEls, { opacity: 0, y: 40 });
        gsap.to(mountEls, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.1,
          ease: "back.out(1.6)",
          delay: 0.05,
        });
      }

      const section = root.querySelector<HTMLElement>("[data-animate-section]");
      const stickyCard = root.querySelector<HTMLElement>("[data-animate-sticky]");
      if (section && stickyCard) {
        gsap.set(stickyCard, { opacity: 0, y: 50, scale: 0.97 });
        gsap.to(stickyCard, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      }
    }, root);

    return () => ctx.revert();
  }, [service.id]);

  return (
    <div ref={pageRootRef} className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div data-animate-mount className="opacity-0 translate-y-10">
          <TrackedCtaLink
            href="/#services"
            ctaId={`service_${service.slug}_back_to_services`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Обратно към услугите
          </TrackedCtaLink>
        </div>

        <div data-animate-section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div
              data-animate-mount
              className="flex items-start gap-4 mb-6 opacity-0 translate-y-10"
            >
              <div className="h-20 w-20 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {iconMap[service.icon]}
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">{service.name}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {service.timeline}
                  </span>
                  <span>
                    от <Price value={service.basePrice} className="text-primary font-semibold" />
                    {service.isMonthly && "/мес"}
                  </span>
                </div>
              </div>
            </div>

            <p
              data-animate-mount
              className="text-lg text-muted-foreground leading-relaxed mb-8 opacity-0 translate-y-10"
            >
              {service.fullDescription}
            </p>

            <Card
              data-animate-mount
              className="bg-card border-border opacity-0 translate-y-10"
            >
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Какво включва</h2>
                <ul className="space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div data-animate-mount className="mt-8 opacity-0 translate-y-10">
              <h2 className="text-lg font-semibold mb-4">Други услуги</h2>
              <div className="flex flex-wrap gap-2">
                {services
                  .filter((s) => s.id !== service.id)
                  .map((s) => (
                    <TrackedCtaLink
                      key={s.id}
                      href={`/services/${s.slug}`}
                      ctaId={`service_${service.slug}_other_${s.slug}`}
                    >
                      <Button variant="outline" size="sm">
                        {s.name}
                      </Button>
                    </TrackedCtaLink>
                  ))}
              </div>
            </div>
          </div>

          <div
            data-animate-sticky
            className="lg:sticky lg:top-24 lg:self-start opacity-0 translate-y-10"
          >
            <PricingConfigurator service={service} />
          </div>
        </div>
      </div>
    </div>
  );
}
